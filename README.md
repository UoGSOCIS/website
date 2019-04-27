[![Build Status](https://travis-ci.com/UoGSOCIS/website.svg?branch=master)](https://travis-ci.com/UoGSOCIS/website)
[![Maintainability](https://api.codeclimate.com/v1/badges/bba39909ad36bfb0d108/maintainability)](https://codeclimate.com/github/UoGSOCIS/website/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/bba39909ad36bfb0d108/test_coverage)](https://codeclimate.com/github/UoGSOCIS/website/test_coverage)

SOCIS Website
==================

This is the official repository for the https://socis.ca website, a student built and maintained website. If you 
feel like joining in on the construction, feel free on cloning this repository and submitting some changes. Code 
is reviewed by the SOCIS exec (specifically the system administrator) before it becomes live,
 so for new students, this could be your first experience with code review!


Contributing
------------

We welcome pull requests and issues but will be strict in our enforcing of
proper programming styles on any submitted code.

In order to contribute, please fork this repository and submit a pull request
to our master branch. Our admin will review the request and inform you of any
changes that need to be made before the merge.

If you are building a large feature, discuss it with us first, and make
multiple small commits. If you submit a single monolithic commit, we will
likely reject it and ask that you split it up.

We reserve the right to reject pull requests and close issues if we do not
agree with how they affect the website.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.


Installation
------------

__1. Clone the Repo__

Most people can probably figure this one out, but I'll leave it here to be safe.
Run `git clone https://github.com/UoGSOCIS/website.git` somewhere locally on your computer to pull the site code from git.
`cd website` to navigate into the newly created folder for the repo.

__2. Install Nodejs__

https://nodejs.org

No need to reiterate the Node docs, this is the part which will take a while to install.


__2. Install MongoDB__

https://www.mongodb.com/download-center/community


It can also be installed using `homebrew` or `apt-get`, follow the instructions on their website to get it installed properly.

__3. Start the web server__

Once everything you need is installed run:

`npm install` to install of the dependencies for the project.


To start the local server, all you need to do is run `npm start` from the website's root directory.
If you open up your browser and navigate to `localhost:3000`, you should now be able to see the site running locally.

_Note that after making any local changes, the start script will automatically reload the changed._



That's all folks!
