# lesser-dannatt

## How to build

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

1.	The project is built in the `out` directory.

## Line endings

All the files in `dict` use LF endings.

Even if there were any CRLF endings, all CRLF endings would be replaced with LF endings by `makeEntries()`, the function defined in `scripts/index.js` that actually loads files from `dict`.