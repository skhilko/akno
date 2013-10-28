akno
======

Yet another JS modal dialog.
To get started, check out this [demo](http://skhilko.github.com/akno) to see it in action!

Browser support:
- IE 9+ (no effects)
- FF 22+ (min for effects)
- Chrome 28+ (min for effects)
- Opera 16+ (min for effects)

Contributing
------------
Contributions are welcome! If you would like to contribute, please issue a pull request. Make sure to test the code.
We are using [mocha](http://visionmedia.github.io/mocha/) with [chai](http://chaijs.com/). Add test cases to `test/spec/test.js`, and run `grunt test`.

Local build
-----------

To build akno locally please run:

`grunt build`

The result will appear in `dist` directory.

Versioning
----------
Akno follows the Semantic Versioning guidelines as much as possible.

Release versions have the following format:

`<major>.<minor>.<patch>`

Updates will occur according to the following guidelines:

* Breaking backward compatibility bumps the major (and resets the minor and patch)
* New additions without breaking backward compatibility bumps the minor (and resets the patch)
* Bug fixes and misc changes bumps the patch

For more information on SemVer, visit [http://semver.org/](http://semver.org/).

License
-------

Copyright (c) 2013 Siarhei Khilko

Licensed under the MIT License.
