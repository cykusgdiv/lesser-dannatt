# lesser-dannatt

## How to run

1.	[Download](https://github.com/GreekFellows/lesser-dannatt/archive/build.zip) the `build` branch as a zip.

1.	Unzip and navigate to `lesser-dannatt-build/out/`.

1.	Find the directory that matches your operating system and architecture.

	**Note:** The project cannot be built for 32-bit Mac OS on my computer. You will have to build it by yourself.

|Directory|Platform|Architecture|
|---|---|---|
|`lesser-dannatt-win32-ia32`|Windows|32-bit|
|`lesser-dannatt-win32-x64`|Windows|64-bit|
|~~`lesser-dannatt-darwin-ia32`~~|~~Mac OS~~|~~32-bit~~|
|`lesser-dannatt-darwin-x64`|Mac OS|64-bit|
|`lesser-dannatt-linux-ia32`|Linux|32-bit|
|`lesser-dannatt-linux-x64`|Linux|64-bit|

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

1.	The project is built in the `out` directory.

## Line endings

All the files in `dict` use LF endings.

Even if there were any CRLF endings, all CRLF endings would be replaced with LF endings by `makeEntries()`, the function defined in `scripts/index.js` that actually loads files from `dict`.