# Gulp, Jade and LESS template-application with Twitter-Bootstrap
[![Build Status](https://travis-ci.org/pure180/DefaultTemplate.svg?branch=master)](https://travis-ci.org/pure180/DefaultTemplate)
[![Dependency Status](https://david-dm.org/pure180/DefaultTemplate.svg)](https://david-dm.org/pure180/DefaultTemplate)

This an easy to handle HTML and CSS template builder application to create compiled HTML-, CSS-, Javascriptfiles.

##### Requierments:
To run this template-application you need to install following tools to your working machine.

* [nodejs ^5+](https://nodejs.org/en/download/)
* npm ^3.8+
* bower  
* gulp

#### Installation instructions

* Download NodeJs from [https://nodejs.org/en/download/](https://nodejs.org/en/download/) and install it.
* Install npm globally, if not yet done, `npm install -g npm`, test npm version with `npm -v`
* Install bower globally, `npm install -g bower` (beware, you need to have [git](https://git-scm.com/downloads) installed to use bower)
* Install gulp globally, `npm install -g gulp`

#### Init Template application and install dependencies
You can use the command, provided by the package.json:

`npm run init`

or, install dependent packages manually with:

`npm install` and `bower install`

#### Start build
run:
`npm run serve`

Open you browser and navigate to `http://127.0.0.1:8888` or `http://localhost:8888`
