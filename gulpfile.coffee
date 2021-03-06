'use-strict'

## DEFAULTS
pkg               = require('./package.json')
gulp              = require('gulp')
del               = require('del')
plumber           = require('gulp-plumber')
notify            = require('gulp-notify')
rename            = require('gulp-rename')
gutil             = require('gulp-util')
connect           = require('gulp-connect')
through           = require('through2')
fs                = require('fs')
_                 = require('lodash')
addsrc            = require('gulp-add-src')

## COFFEE & BOWER
coffee            = require('gulp-coffee')
concat            = require('gulp-concat')
jshint            = require('gulp-jshint')
uglify            = require('gulp-uglify')
bower             = require('bower')
mainBowerFiles    = require('main-bower-files')
replace           = require('gulp-replace')
path              = require('path')
header            = require('gulp-header')
runSequence       = require('run-sequence')

## JADE
pug               = require('gulp-pug');
puginheritance    = require('gulp-pug-inheritance')
data              = require('gulp-data')
glob              = require('glob')
filter            = require('gulp-filter')
changed           = require('gulp-changed')
cached            = require('gulp-cached')
gulpif            = require('gulp-if')

## LESS
less              = require('gulp-less')
autoprefixer      = require('gulp-autoprefixer')
sourcemaps        = require('gulp-sourcemaps')
cleanCSS          = require('gulp-clean-css')
bowerLess         = require('./lib/bower.less.js')

## IMAGES
imagemin          = require('gulp-imagemin')

ftp               = require('gulp-ftp')



### SETTINGS ==================================================================
=========================================================================== ###

notifier =
  served: 'Served "<%= file.path %>"'
  copied: 'Copied "<%= file.path %>"'
  uploaded: 'Uploaded "<%= file.path %>"'

root =
  src : 'src'
  dest: 'dist'

settings =
  server:
    root: root.dest
    livereload: true
    port: 8888

  ftp:
    host: '127.0.0.1'
    user: 'username'
    pass: '****'
    remotePath: '/'
    uploadFiles: false

  path:
    src:
      coffee:   path.join root.src, 'coffee','**','*.coffee'
      js:       path.join root.src, 'js','**','*.js'
      pug:      path.join root.src, 'pug', '**', '*.pug'
      pugData:
        file:   path.join root.src, 'pug', '_data', 'file', '**', '*.json'
        project: path.join root.src, 'pug', '_data', '*.json'

      less:     path.join root.src, 'less'
      img: [
                path.join root.src, 'img','**','*.jpg'
                path.join root.src, 'img','**','*.JPG'
                path.join root.src, 'img','**','*.png'
                path.join root.src, 'img','**','*.PNG'
                path.join root.src, 'img','**','*.gif'
                path.join root.src, 'img','**','*.GIF'
                path.join root.src, 'img','**','*.svg'
                path.join root.src, 'img','**','*.SVG'
      ]
      video: [
                path.join root.src, 'video','**','*.mp4'
                path.join root.src, 'video','**','*.webm'
                path.join root.src, 'video','**','*.ogv'
      ]
      fonts: [
                path.join root.src, 'fonts','**','*.eot'
                path.join root.src, 'fonts','**','*.svg'
                path.join root.src, 'fonts','**','*.ttf'
                path.join root.src, 'fonts','**','*.woff'
                path.join root.src, 'fonts','**','*.woff2'
      ]

    dest:
      js:       path.join root.dest, '/js'
      css:      path.join root.dest, '/css'
      fonts:    path.join root.dest, '/fonts'
      img:      path.join root.dest, '/img'
      video:    path.join root.dest, '/video'
      temp:     path.join root.src, 'temp'


    watch:
      coffee:   path.join root.src, 'coffee','**','*.coffee'
      js:       path.join root.src, 'js','**','*.js'
      less:     path.join root.src, 'less','**','*.less'
      pugData:  path.join root.src, 'pug', '_data', '**', '*.json'


  autoprefixer:
    browsers: [
      "Android 2.3",
      "Android 4",
      "Android >= 4",
      "Chrome >= 20",
      "ChromeAndroid >= 20",
      "Firefox >= 24",
      "Explorer >= 8",
      "iOS >= 6",
      "Opera >= 12",
      "Safari >= 6"
    ],
    cascade: true



### HELPER FUNCTIONS ==========================================================
=========================================================================== ###

copy = (src, dist) ->
  gulp.src(src).pipe(plumber((error) ->
    gutil.log error.message
    @emit 'end'
    return
  ))
  .pipe(changed(dist))
  .pipe(gulp.dest(dist))
  .pipe(notify(message: notifier.served))
  .pipe connect.reload()

getDateTime = ->
  date = new Date();
  return date

timestamp = getDateTime()


### CLEAN TASK ================================================================
===========================================================================
###

gulp.task 'clean', ->
  del [
    root.dest + '/**/*.html'
    settings.path.dest.js + '/**/*.js'
    settings.path.dest.css + '/**/*.css'
    settings.path.dest.css + '/**/*.map'
    settings.path.dest.img + '/**/*.*'
    settings.path.dest.fonts + '/**/*.*'
  ]

### COFFEE SKRIPT TASK ========================================================
=========================================================================== ###

coffeTask = (src, dist, name, isGulpfile, note) ->
  isNotGulpfile = if !isGulpfile then true else false
  bare = if !isGulpfile then true else false
  return gulp.src(src)
  .pipe(plumber((error) ->
    gutil.log error.message
    @emit 'end'
    return
  ))
  .pipe(coffee().on('error', gutil.log))
  .pipe(jshint('.jshintrc'))
  .pipe(gulpif(isNotGulpfile, concat( name + '.js')))
  .pipe(gulp.dest(dist))
  .pipe(notify(message: note))
  .pipe(gulpif(isNotGulpfile, rename(suffix: '.min')))
  .pipe(gulpif(isNotGulpfile, uglify()))
  .pipe(gulpif(isNotGulpfile, gulp.dest(dist)))
  .pipe(gulpif(isNotGulpfile, notify(message: note)))
  .pipe connect.reload()


gulp.task 'app:coffee', ->
  coffeTask settings.path.src.coffee, settings.path.dest.js, 'apps', false, notifier.served



### JAVASKRIPT TASK ===========================================================
=========================================================================== ###

javaScriptTask = (src, dist, name, note) ->
  gulp.src(src)
  .pipe(plumber((error) ->
    gutil.log error.message
    @emit 'end'
    return
  ))
  .pipe(jshint('.jshintrc'))
  .pipe(concat( name + '.js'))
  .pipe(gulp.dest(dist))
  .pipe(notify(message: note))
  .pipe(rename(suffix: '.min'))
  .pipe(uglify())
  .pipe(gulp.dest(dist))
  .pipe notify(message: note)

gulp.task 'app:javascript', ->
  javaScriptTask settings.path.src.js, settings.path.dest.js, 'scripts', notifier.served

### JADE TASK =================================================================
===========================================================================
###

getJson = (paths) ->
  json = {}
  files = glob.sync paths
  for key of files
    `key = key`
    if fs.existsSync(files[key])
      parsedJson = {}
      if files[key]
        try
          parsedJson = JSON.parse(fs.readFileSync(files[key]))
        catch e
          console.log(e)
          console.log(files[key])
      json = _.assignIn json, _.merge json, parsedJson
  return json

getPugData = (data) ->
  pugData = {}
  if typeof data == 'object'
    for key of data
      pugData[key] = getJson path.join('.', data[key])
  else
    pugData = getJson path.join('.', data)
  return pugData


jadeTask = (src, dist, note, inheritance) ->
  inherit = if inheritance then true else false
  pugData = getPugData(settings.path.src.pugData)

  gulp.src(src)
  .pipe(plumber((error) ->
    gutil.log error.message
    @emit 'end'
    return
  ))
  .pipe(gulpif(inherit, changed('dist', extension: '.html')))
  .pipe(gulpif(inherit, gulpif(global.isWatching, cached('jade'))))
  .pipe(gulpif(inherit, puginheritance(
    basedir: 'src/pug'
    extension: '.pug'
    skip: 'node_modules'
  )))
  .pipe(filter((file) ->
    !/\/_/.test(file.path) and !/^_/.test(file.relative)
  ))
  .pipe(data((file) ->
    return pugData
  ))
  .pipe(pug(pretty: true))
  .pipe(gulp.dest(dist))
  .pipe(notify(message: note))
  .pipe connect.reload()

gulp.task 'jade', ->
  return jadeTask settings.path.src.pug, root.dest, notifier.served, true

gulp.task 'jade:json', ->
  return jadeTask settings.path.src.pug, root.dest, notifier.served, false

gulp.task 'setWatch', ->
  global.isWatching = true
  return

### LESS TASK =================================================================
===========================================================================
###

lessTask = (src, dist, minify, note) ->
  min = if minify then true else false
  gulp.src(src)
  .pipe(plumber((error) ->
    gutil.log error.message
    @emit 'end'
    return
  ))
  .pipe(sourcemaps.init())
  .pipe(less())
  .pipe(autoprefixer(settings.autoprefixer))
  .pipe(gulpif(min, rename(suffix: '.min')))
  .pipe(gulpif(min, cleanCSS(compatibility: 'ie8')))
  #.pipe(changed(dist, extension: '.css'))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(dist))
  .pipe(notify(message: note))
  .pipe connect.reload()


gulp.task 'app:less:normal', ->
  lessTask path.join(settings.path.src.less, 'theme.less'), settings.path.dest.css, false, notifier.served

gulp.task 'app:less:minified', ->
  lessTask path.join(settings.path.src.less, 'theme.less'), settings.path.dest.css, true, notifier.served

gulp.task 'app:less', [
  'app:less:normal'
  'app:less:minified'
]

### IMAGES TASKS ===============================================================
=========================================================================== ###

gulp.task 'app:images', ->
  gulp.src(settings.path.src.img)
  .pipe(plumber((error) ->
    gutil.log error.message
    @emit 'end'
    return
  ))
  .pipe(changed(settings.path.dest.img))
  .pipe(imagemin())
  .pipe(gulp.dest(settings.path.dest.img))
  .pipe(notify(message: notifier.served))
  .pipe connect.reload()

gulp.task 'app:copy:ico', ->
  copy root.src + 'img/**/*.ico', settings.path.dest.img
gulp.task 'app:copy:xml', ->
  copy root.src + 'img/**/*.xml', settings.path.dest.img
gulp.task 'app:copy:json', ->
  copy root.src + 'img/**/*.json', settings.path.dest.img

gulp.task 'app:copy:fav', ['app:copy:ico', 'app:copy:xml', 'app:copy:json']



### VIDEO TASKS ===============================================================
=========================================================================== ###

gulp.task 'app:video', ->
  copy settings.path.src.video, settings.path.dest.video



### VIDEO TASKS ===============================================================
=========================================================================== ###

gulp.task 'app:fonts', ->
  copy settings.path.src.fonts, settings.path.dest.fonts



### REBUILD GULPFILE============================================================
=========================================================================== ###

gulp.task 'app:gulp', ->
  coffeTask './gulpfile.coffee', './', true, notifier.served

### WATCH AND SERVER TASKS =====================================================
=========================================================================== ###

gulp.task 'app:server', ->
  connect.server settings.server
  return

gulp.slurped = false



gulp.task 'app:watch', ['setWatch', 'jade'], ->

  gulp.watch settings.path.watch.coffee, [ 'app:coffee' ]
  gulp.watch settings.path.watch.js, [ 'app:javascript' ]
  gulp.watch settings.path.watch.pugData, [ 'jade:json' ]
  gulp.watch settings.path.src.fonts, [ 'app:fonts' ]
  gulp.watch settings.path.src.pug, [ 'jade' ]
  gulp.watch settings.path.watch.less, [ 'app:less' ]
  gulp.watch settings.path.src.img, [ 'app:images' ]
  gulp.watch settings.path.src.video, [ 'app:video' ]


  gulp.watch path.join(settings.path.src.less,'variables','**', '*.less'), [ 'bower:less', 'app:less' ]

  gulp.watch ['bower_components/**/*.less', 'bower_components/**/*.css'], [ 'bower:less' ]
  gulp.watch 'bower_components/**/*.js', [ 'bower:javascript' ]

  if settings.ftp.uploadFiles
    gulp.watch root.dest + '/**/*.html', ['ftp:html']
    gulp.watch settings.path.dest.css + '/**/*.css', ['ftp:css']
    gulp.watch settings.path.dest.js + '/**/*.js', ['ftp:js']
    gulp.watch settings.path.dest.fonts + '/**/*.*', ['ftp:fonts']
    gulp.watch settings.path.dest.img + '/**/*.*', ['ftp:img']
    gulp.watch settings.path.dest.video + '/**/*.*', ['ftp:video']

  return



### BUILD TASKS ===============================================================
=========================================================================== ###

gulp.task 'build', [
  'app:coffee'
  'jade'
  'app:less'
  'app:javascript'
  'app:images'
  'app:video'
  'app:copy:fav'
  'app:fonts'
]

gulp.task 'build:watch', [
  'app:coffee'
  'app:less'
  'app:javascript'
  'app:images'
  'app:video'
  'app:copy:fav'
  'app:fonts'
]

gulp.task 'app:init', ['app:watch', 'app:server']

### BOWER TASKS ===============================================================
=========================================================================== ###

gulp.task 'bower:get', (cb) ->
  bower.commands.install([], { save: true }, {}).on 'end', (installed) ->
    cb()
    return
  return

gulp.task 'bower:javascript', ->
  javaScriptTask mainBowerFiles('**/*.js'), settings.path.dest.js, 'libs', notifier.served

bowerLessTask = (src, dist, minify, note) ->
  min = if minify then true else false
  return gulp.src(src)
    .pipe(plumber((error) ->
      gutil.log error.message
      @emit 'end'
      return
    ))
    .pipe bowerLess basedir: 'src/less'
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe addsrc.append(mainBowerFiles('**/*.css'))
    .pipe(autoprefixer(settings.autoprefixer))
    .pipe(concat('libs.css'))
    .pipe(gulpif(min, rename(suffix: '.min')))
    .pipe(gulpif(min, cleanCSS(compatibility: 'ie8')))
    #.pipe(changed(dist, extension: '.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
    .pipe(notify(message: note))
    .pipe connect.reload()

gulp.task 'bower:less:normal', ->
  bowerLessTask mainBowerFiles('**/*.less'), settings.path.dest.css, false, notifier.served

gulp.task 'bower:less:minified', ->
  bowerLessTask mainBowerFiles('**/*.less'), settings.path.dest.css, true, notifier.served

gulp.task 'bower:less', ['bower:less:normal', 'bower:less:minified']


gulp.task 'bower:fonts', ->
  gulp.src('./bower_components')
  .pipe through.obj((file, enc, cb) ->

    bowerDir = fs.readdirSync(file.path)

    source = []
    for dir of bowerDir
      `dir = dir`
      folderName = bowerDir[dir]
      source.push path.join(file.path, folderName, 'fonts', '**', '*')
    gulp.src(source)
    .pipe(plumber((error) ->
      gutil.log error.message
      @emit 'end'
      return
    ))
    .pipe(gulp.dest(settings.path.dest.fonts))
    .pipe(notify(message: notifier.served))
    .pipe connect.reload()

    cb null, file
    return
  )
gulp.task 'bower:task', [
  'bower:javascript'
  'bower:less'
  'bower:fonts'
]
gulp.task 'bower', [ 'bower:get' ], ->
  gulp.start 'bower:task'

### FTP TASKS =================================================================
=========================================================================== ###

uploadFiles = (src, dist) ->
    gulp.src(src)
      .pipe(ftp(
        host: settings.ftp.host
        user: settings.ftp.user
        pass: settings.ftp.pass
        remotePath : settings.ftp.remotePath + dist
      ))
      .pipe(notify(message: notifier.uploaded))
      .pipe(gutil.noop())


gulp.task 'ftp:html', ->
  uploadFiles root.dest + '/**/*.html', ''

gulp.task 'ftp:css', ->
  uploadFiles [settings.path.dest.css + '/**/*.css', settings.path.dest.css + '/**/*.css.map'], '/css'

gulp.task 'ftp:js', ->
  uploadFiles settings.path.dest.js + '/**/*.js', '/js'

gulp.task 'ftp:fonts', ->
  uploadFiles settings.path.dest.fonts + '/**/*.*', '/fonts'

gulp.task 'ftp:img', ->
  uploadFiles settings.path.dest.img + '/**/*.*', '/img'

gulp.task 'ftp:video', ->
  uploadFiles settings.path.dest.video + '/**/*.*', '/video'
