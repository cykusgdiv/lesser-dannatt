# lesser-dannatt

An Old Icelandic to English dictionary built with Electron.

The dictionary data are from a digitized version of Geir Tómasson Zoëga's _A Concise Dictionary of Old Icelandic_, kindly provided by Tim Ermolaev (stridmann at gmail dot com).

## How to download and run

1.	Go to [Releases](https://github.com/GreekFellows/lesser-dannatt/releases) and find a release.

1.	Find the zip file that matches your operating system and architecture.

1.	Download, unzip and run the executable inside.

## How to build

1.	[Download](https://github.com/GreekFellows/lesser-dannatt/archive/master.zip) the repository as a zip. Navigate inside the unzipped repository.

1.	Install `electron-packager` if you have not yet done so:

	```sh
	npm install -g electron-packager
	```

1.	Run `npm install` to get all the modules required to build the project:

	```sh
	npm install
	```

1.	Build the project with `electron-packager`.

	For Windows:

	```sh
	electron-packager . --out=out --platform=win32
	```

	For Mac OS:

	```sh
	electron-packager . --out=out --platform=darwin
	```

	For Linux:

	```sh
	electron-packager . --out=out --platform=linux
	```

	For more information on how to use `electron-packager`, see their [README](https://github.com/electron-userland/electron-packager#usage).

1.	The project is built in the `out` directory.

## Line endings

All the files in `dict` use LF endings.

Even if there were any CRLF endings, all CRLF endings would be replaced with LF endings by `makeEntries()`, the function defined in `scripts/index.js` that actually loads files from `dict`.