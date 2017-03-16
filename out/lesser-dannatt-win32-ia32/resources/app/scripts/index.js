var fs = require("fs");
var shell = require("electron").shell;
var path = require("path");

var abbrevMap = {
	"a.": "adjective",
	"absol.": "absolute, absolutely",
	"acc.": "accusative",
	"adv.": "adverb",
	"card. numb.": "cardinal number",
	"Cf.": "confer",
	"cf.": "confer",
	"compar.": "comparative",
	"compds.": "compounds",
	"conj.": "conjunction",
	"dat.": "dative",
	"def. art.": "definite article",
	"dem. pron.": "demonstrative pronoun",
	"e-a": "einhverja",
	"e-m": "einhverjum",
	"e-n": "einhvern",
	"e-rra": "einhverra",
	"e-rri": "einhverri",
	"e-s": "einhvers",
	"e-t": "eitthvert",
	"e-u": "einhverju",
	"esp.": "especially",
	"f.": "feminine noun",
	"for.": "foreign",
	"fem.": "feminine",
	"freq.": "frequent, frequently",
	"gen.": "genitive",
	"i. e.": "id est",
	"imperat.": "imperative",
	"impers.": "impersonal",
	"indecl.": "indeclinable",
	"indef. pron.": "indefinite pronoun",
	"infin.": "infinitive",
	"int. pron.": "interrogative pronoun",
	"interj.": "interjection",
	"m.": "masculine noun",
	"masc.": "masculine",
	"n.": "neuter noun",
	"neut.": "neuter",
	"nom.": "nominative",
	"ord. numb.": "ordinal number",
	"pers. pron.": "personal pronoun",
	"pl.": "plural",
	"poet.": "poetically",
	"poss. pron.": "possessive pronoun",
	"pp.": "past participle",
	"pr. p.": "present participle",
	"prep.": "preposition",
	"pron.": "pronoun",
	"recipr.": "reciprocally",
	"refl.": "reflexive",
	"refl. pron.": "reflexive pronoun",
	"rel. pron.": "relative pronoun",
	"sing.": "singular",
	"superl.": "superlative",
	"v.": "verb",
	"v. refl.": "reflexive verb",
	"viz.": "namely"
};

var oums = ["ǫ", "ö", "ø"];

var dictsLoaded = 0;
var length = 30;
var headDictMap = {};
var heads = [
	"a", "á", "æ", "b", "d",
	"e", "f", "g", "h", "i",
	"í", "j", "k", "l", "m",
	"n", "o", "œ", "ó", oums[0],
	"p", "r", "s", "t", "þ",
	"u", "ú", "v", "y", "ý"
];
var headDictPaths = [
	"dict/a.dsl",	"dict/aa.dsl",	"dict/ae.dsl",	"dict/b.dsl",	"dict/d.dsl",
	"dict/e.dsl",	"dict/f.dsl",	"dict/g.dsl",	"dict/h.dsl",	"dict/i.dsl",
	"dict/ii.dsl",	"dict/j.dsl",	"dict/k.dsl",	"dict/l.dsl",	"dict/m.dsl",
	"dict/n.dsl",	"dict/o.dsl",	"dict/oe.dsl",	"dict/oo.dsl",	"dict/oum.dsl",
	"dict/p.dsl",	"dict/r.dsl",	"dict/s.dsl",	"dict/t.dsl",	"dict/th.dsl",
	"dict/u.dsl",	"dict/uu.dsl",	"dict/v.dsl",	"dict/y.dsl",	"dict/yy.dsl"
];

// ignore hyphens ins earch
// replace oum variations

var userMaySearch = false;

class Entry {
	constructor(headwordForms, descLines) {
		this.headwordForms = headwordForms;
		this.descLines = descLines;

		this.makeCardHtmlString();
	}

	makeCardHtmlString() {
		// this.cardHtmlString = this.descLines;
		this.cardHtmlString = "<div class=\"card\"><div class=\"card-block\"><h4 class=\"card-title\">";
		this.cardHtmlString += this.headwordForms.join(", ");
		this.cardHtmlString += "</h4><p class=\"card-text\">";

		var currentIndent = 0;
		for (var i = 0; i < this.descLines.length; ++i) {/**/
			var headwords = this.headwordForms.join(", ");
			var descLine = this.descLines[i];
			var htmlString = "";
			var parseSuccess = true;

			var index = 0;
			var match = this.match(descLine, index, "[m");
			index = match.index;

			/*
			[m1]a[/m]
			[m1]b[/m]
			[m2]c[/m]
			[m1]d[/m]

			converts to:

			<ul>
				<li>a</li>
				<li>b</li> // if new indent == current indent, just add <li>, close with </li>
				<ul>
					<li>c</li> // if new indent > current indent, add <ul><li>, close with </li>
				</ul>
				<li>d</li> // if new indent < current indent, add </ul><li>, close with </li>
			</ul> // at the end, add </ul>
			*/

			if (match.result) {
				var indent = this.peekInt(descLine, index);
				index = indent.index;

				if (!isNaN(indent.result)) {
					match = this.match(descLine, index, "]");
					index = match.index;

					if (match.result) {
						if (indent.result == currentIndent) {
							htmlString += "<li>";
						}
						else if (indent.result > currentIndent) {
							htmlString += "<ul><li>";
						}
						else {
							htmlString += "</ul><li>";
						}
						currentIndent = indent.result;

						var lineEnded = false;

						var recordAbbrev = false;
						var abbrev = "";

						while ((index < descLine.length) && !lineEnded) {
							match = this.match(descLine, index, "[/m]");
							index = match.index;
							if (match.result) {
								htmlString += "</li>";
								lineEnded = true;
								continue;
							}

							match = this.match(descLine, index, "[i]");
							index = match.index;
							if (match.result) {
								htmlString += "<em>";
								continue;
							}

							match = this.match(descLine, index, "[/i]");
							index = match.index;
							if (match.result) {
								htmlString += "</em>";
								continue;
							}

							match = this.match(descLine, index, "[trn]");
							index = match.index;
							if (match.result) {
								continue;
							}

							match = this.match(descLine, index, "[/trn]");
							index = match.index;
							if (match.result) {
								continue;
							}

							match = this.match(descLine, index, "[com]");
							index = match.index;
							if (match.result) {
								continue;
							}

							match = this.match(descLine, index, "[/com]");
							index = match.index;
							if (match.result) {
								continue;
							}

							match = this.match(descLine, index, "[p]");
							index = match.index;
							if (match.result) {
								recordAbbrev = true;
								continue;
							}

							match = this.match(descLine, index, "[/p]");
							index = match.index;
							if (match.result) {
								var abbrevTooltip = abbrevMap.hasOwnProperty(abbrev) ? abbrevMap[abbrev] : "Unknown abbreviation";
								htmlString += ("<a href=\"javascript:void(0)\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + abbrevTooltip +  "\">" + abbrev + "</a>");
								recordAbbrev = false;
								abbrev = "";
								continue;
							}

							match = this.match(descLine, index, "[ref]");
							index = match.index;
							if (match.result) {
								// htmlString += "<a href=\"javascript:void(0)\" class=\"ref\" data-toggle=\"modal\" data-target=\"#ref-modal\">";
								htmlString += "<a href=\"javascript:void(0)\" class=\"ref\">";
								continue;
							}

							match = this.match(descLine, index, "[/ref]");
							index = match.index;
							if (match.result) {
								htmlString += "</a>";
								continue;
							}

							if (recordAbbrev) {
								abbrev += descLine[index];
							}
							else {
								htmlString += descLine[index];
							}
							++index;
						}

						if (!lineEnded) {
							showSearchableError("Malformed dictionary entry (line does not end with [/m]) for headwords: " + headwords);
							parseSuccess = false;
						}
					}
					else {
						showSearchableError("Malformed dictionary entry (] does not follow indent number) for headwords: " + headwords);
						parseSuccess = false;
					}
				}
				else {
					showSearchableError("Malformed dictionary entry (indent number does not follow [m) for headwords: " + headwords);
					parseSuccess = false;
				}
			}
			else {
				showSearchableError("Malformed dictionary entry (line does not start with [m) for headwords: " + headwords);
				parseSuccess = false;
			}

			if (parseSuccess) {
				this.cardHtmlString += htmlString;
			}
			else {
				showSearchableError("Parse failed for dictionary entry with headwords: " + headwords + ", attempted to parse line: <code>" + descLine + "</code");
			}
		}

		this.cardHtmlString += "</p></div></div>";
	}

	peekInt(from, index) {
		var intRepr = "";
		var result = NaN;

		while (index < from.length) {
			var ch = from.charAt(index);
			if (!this.isDigit(ch)) {
				break;
			}

			intRepr += ch;
			result = parseInt(intRepr, 10);
			++index;
		}

		return {
			index: index,
			result: result
		};
	}

	match(from, index, what) {
		var result = (from.length >= index + what.length) && (from.substring(index, index + what.length) == what);

		return {
			index: (result ? index + what.length : index),
			result: result
		};
	}

	isDigit(s) {
		return "1234567890".indexOf(s) != -1;
	}
}

function makeHeadDictMap() {
	for (var i = 0; i < length; ++i) {
		// var dictPath = headDictPaths[i]; // for local testing
		var dictPath = path.join(process.resourcesPath, "app", headDictPaths[i]); // for packaging

		fs.readFile(dictPath, "utf8", function(err, data) {
			if (err) {
				if (err.code === "ENOENT") {
					showUnsearchableError("A dictionary file did not load properly. Please reload.");
				}
				else {
					throw err;
				}
			}

			var head = data[0].toLowerCase();

			if (oums.indexOf(head) != -1) {
				headDictMap[oums[0]] = makeEntries(data);
			}
			else {
				headDictMap[head] = makeEntries(data);
			}

			++dictsLoaded;
			if (dictsLoaded == length) {
				$("#loading-row").hide();
				userMaySearch = true;
			}
		});
	}
}

function makeEntries(dict) {
	var entries = [];

	// CRLF to LF
	dict.replace(/\r\n/g, "\n");

	var i = 0;
	while (i < dict.length) {
		var headwordForms = [];
		while (i < dict.length && dict.charAt(i) != "\t") {
			var headwordForm = "";
			while (i < dict.length && dict.charAt(i) != "\n") {
				headwordForm += dict.charAt(i);
				i < dict.length ? ++i : i;
			}
			i < dict.length ? ++i : i;
			headwordForms.push(headwordForm);
		}

		var descLines = [];
		while (i < dict.length && dict.charAt(i) == "\t") {
			i < dict.length ? ++i : i;
			var descLine = "";
			while (i < dict.length && dict.charAt(i) != "\n") {
				descLine += dict.charAt(i);
				i < dict.length ? ++i : i;
			}
			i < dict.length ? ++i : i;
			descLines.push(descLine);
		}

		if (headwordForms.length > 0 && descLines.length > 0) {
			entries.push(new Entry(headwordForms, descLines));
		}
	}

	return entries;
}

/*
	Considering the feature that enables the user to click a word enclosed by [ref]...[/ref] and view the card for that entry,
	the search function should take a word, options, and return an array of Entries.

	Cards generated from entries searched for from the text input will be stacked in the column to the right,
	while those from entries searched for [ref]-clicks will be displayed as a popup, or something temporal.
*/

function getCommonPrefixLength(s0, s1) {
	var length = 0;

	while (length <= s0.length && length <= s1.length && s0.substring(0, length) == s1.substring(0, length)) {
		++length;
	}

	return length - 1;
}

function regularize(what) {
	var res = "";
	for (var i = 0; i != what.length; ++i) {
		var ch = what.charAt(i);

		if (ch == "-") {
			continue;
		}
		else if (oums.indexOf(ch) != -1) {
			res += oums[0];
		}
		else {
			res += ch;
		}
	}
	return res;
}

function search(rawwhat, options) {
	var entries = [];
	var what = regularize(rawwhat);

	if (!userMaySearch) {
		return entries;
	}

	if (what.length == 0) {
		return entries;
	}

	if (!headDictMap.hasOwnProperty(what[0])) {
		return entries;
	}

	var perfectMatchOption = false;
	if (options.hasOwnProperty("perfectMatch")) {
		perfectMatchOption = options["perfectMatch"];
	}

	// search!
	var fromEntries = headDictMap[what[0]];
	var maxCommonPrefixLength = 1;

	for (var i = 0; i != fromEntries.length; ++i) {
		var currentEntry = fromEntries[i];
		var isTarget = false;
		for (var j = 0; j != currentEntry.headwordForms.length; ++j) {
			var currentHeadwordForm = regularize(currentEntry.headwordForms[j]);

			if (perfectMatchOption) {
				if (currentHeadwordForm == what) {
					isTarget = true;
					break;
				}
				continue;
			}

			var commonPrefixLength = getCommonPrefixLength(what, currentHeadwordForm);

			if (maxCommonPrefixLength < commonPrefixLength) {
				maxCommonPrefixLength = commonPrefixLength;
				entries = [];
			}

			if (maxCommonPrefixLength == commonPrefixLength) {
				isTarget = true;
				// we cannot break here because we might haven't yet checked through all headword forms!
			}
		}

		if (isTarget) {
			entries.push(currentEntry);
		}
	}

	return entries;
}

function triggerSearch() {
	if (jQuery.isReady) {
		var what = $("#search-term-input").val();
		var entries = search(what, {
			perfectMatch: $("#perfect-match-checkbox").is(":checked")
		});

		$("#search-results").empty();
		if (entries.length == 0) {
			showSearchError("No matches found. Confirm that all dictionary entries are loaded correctly - do you see any errors below the search box to the left of this message?");
		}
		else {
			showSearchSuccess("One or more matches found.");

			for (var i = 0; i != entries.length; ++i) {
				$("#search-results").append(entries[i].cardHtmlString);
			}
		}

		activateTooltips();
		activateRefCardsInsertion();
	}
}

function activateTooltips() {
	$('[data-toggle="tooltip"]').tooltip();
}

function setupRefModal() {
	$("#ref-modal").on("show.bs.modal", function(event) {
		var ref = $(event.relatedTarget).text();

		var refEntries = search(ref, {
			perfectMatch: true
		});

		var refTooltip = "<div class=\"alert alert-danger\" role=\"alert\"><strong>Search failed.</strong> No entries found for this word.</div>";

		if (refEntries.length > 0) {
			refTooltip = "";
			for (var i = 0; i < refEntries.length; ++i) {
				refTooltip += refEntries[i].cardHtmlString;
			}
		}

		$("#ref-modal-label").html("Quick lookup: " + ref);
		$("#ref-modal-body").empty();
		$("#ref-modal-body").append(refTooltip);
	});
}

function activateRefCardsInsertion() {
	$(".ref").on("click", function() {
		var ref = $(this).text();

		var refEntries = search(ref, {
			perfectMatch: true
		});

		var refTooltip = "<div class=\"card embedded-card\"><div class=\"card-header\">Quick lookup: " + ref + "<button type=\"button\" class=\"close\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div><div class=\"card-block\">";

		if (refEntries.length > 0) {
			for (var i = 0; i < refEntries.length; ++i) {
				refTooltip += refEntries[i].cardHtmlString;
			}
		}
		else {
			refTooltip += "<div class=\"alert alert-danger\" role=\"alert\"><strong>Search failed.</strong> No entries found for the word: <strong>" + ref + "</strong>.</div>";
		}

		refTooltip += "</div></div>";

		$(this).after(refTooltip);

		// the generated cards may contain tooltips, which must then be enabled
		activateTooltips();

		// close button should work
		$(".embedded-card").on("click", ".close", function(event) {
			$(event.delegateTarget).hide();
		});
	});
}

function showUnsearchableError(info) {
	$("#critical-errors").append("<div class=\"alert alert-danger\" role=\"alert\"><strong>Critical error. Search is disabled.</strong> " + info + "</div>");

	$("#error-row").show();
	$("#search-row").hide();
}

function showSearchableError(info) {
	$("#search-errors").append("<div class=\"alert alert-danger\" role=\"alert\"><strong>Error. Search is probably incomplete.</strong> " + info + "</div>");
}

function showSearchSuccess(info) {
	$("#search-results").append("<div class=\"alert alert-success\" role=\"alert\"><strong>Search success.</strong> " + info + "</div>");
}

function showSearchError(info) {
	$("#search-results").append("<div class=\"alert alert-danger\" role=\"alert\"><strong>Search failed.</strong> " + info + "</div>");
}

$(document).ready(function() {
	// check userMaySearch before any searching may proceed
	$("#error-row").hide();

	// activate them anyways, we need help tooltips to work
	activateTooltips();

	// enable tooltips for [p]...[/p] (abbreviations)
	makeHeadDictMap();
	// setupRefModal();

	$("a[ext-href]").append(" <i class=\"fa fa-external-link\" aria-hidden=\"true\"></i>");

	$("a[ext-href]").on("click", function() {
		shell.openExternal($(this).attr("ext-href"));
	});

	$("#ref-modal").on("show.bs.modal", function() {
		activateTooltips();
	});
});