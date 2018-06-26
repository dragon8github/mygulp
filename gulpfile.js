// cnpm i -g gulpjs/gulp#4.0 && cnpm i gulpjs/gulp#4.0 gulp-sass fs-extra gulp-autoprefixer gulp-sourcemaps browser-sync gulp-ejs gulp-rename gulp-babel babel-core babel-preset-env babel-preset-stage-2 gulp-typescript typescript -S
const gulp         = require('gulp')
const babel        = require('gulp-babel')
const ts           = require('gulp-typescript')
const sass         = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps   = require('gulp-sourcemaps')
const rename       = require('gulp-rename')
const browserSync  = require('browser-sync').create()
const fse          = require('fs-extra')
const path         = require('path');

// 初始化
gulp.task('init', function () {
     // 获取当前文件路径（兼容windows）
     var PWD = process.env.PWD || process.cwd();
     var dirs = ['dist',
                 'dist/html',
                 'dist/css',
                 'dist/img',
                 'dist/js',
                 'src','src/sass',
                 'src/js',
                 'src/img',
                 'src/sprite'
      ];
      
      dirs.forEach(function (item,index) {
          try {
            // 使用mkdirSync方法新建文件夹
            fse.mkdirSync(path.join(PWD + '/'+ item));
          } catch (err) {
              // 如果文件夹已存在就别逼逼了
              if (err.message.indexOf('file already exists')) {
                  // ...
              } else {
                // 发现其他错误就打印出来
                console.log(err.message);
              }
          }
      })

      // 必须返回一个steam / promise对象
      // https://stackoverflow.com/questions/36897877/gulp-error-the-following-tasks-did-not-complete-did-you-forget-to-signal-async
      // https://blog.csdn.net/qq_41208114/article/details/79109269
      return gulp.src('package.json'); 

})

// 编译typescript
gulp.task('ts', function () {
    return gulp.src('./src/js/*.ts')
               .pipe(sourcemaps.init())
               .pipe(ts({
                  'noImplicitAny': true,
                  'target': 'es5'
               }))  
               .pipe(sourcemaps.write('./')) // src/js/map
               .pipe(gulp.dest('./')) // src/js
})

// 编译babel
gulp.task('babel', function () {
    return gulp.src('./src/js/*.es')
               .pipe(sourcemaps.init())
               .pipe(babel({
                  presets: [
                      [
                         'env',
                        {
                          'targets': {
                            'browsers': ['last 5 versions', 'ie >= 8']
                          }
                        }
                      ],
                      'babel-preset-stage-2'
                  ]
               }))
               .pipe(sourcemaps.write('./map')) // 这里的地址是相对于gulp.dest输出目录的，并且必须在gulp.dest输出之前执行
               .pipe(gulp.dest('./dist/js'))

})

// 编译sass
gulp.task('sass', function () {
  return gulp.src('./src/sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
             browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
             cascade: true,
             remove: true
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./map'))  // 这里的地址是相对于gulp.dest输出目录的，并且必须在gulp.dest输出之前执行
        .pipe(gulp.dest('./dist/assets/css'))
})

// watch
gulp.task('watch', function () {
    // 监听重载文件
    var files = [
        'src/html/*.html',
        'src/css/*.css',
        'src/js/*.es',
        'src/js/*.ts',
        'src/sprite/*.png'
    ]
    browserSync.init(files, {
        server: {
            baseDir: './src/html/',
        }
    })
    gulp.watch('./src/sass/*.scss', gulp.series('sass'))
    gulp.watch('./src/js/*.es', gulp.series('babel'))
    gulp.watch('./src/js/*.js', gulp.series('babel'))
    gulp.watch('./src/html/*.html').on('change', browserSync.reload)
})


// 开发环境
gulp.task('dev', gulp.series('init', gulp.parallel('sass', 'babel', 'ts'), 'watch'))
