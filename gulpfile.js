const gulp = require('gulp'); // Подключаем Gulp
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
//const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const fileinclude = require('gulp-file-include');
const pug = require('gulp-pug');
const del = require('del');
const group_media = require('gulp-group-css-media-queries');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const spritesmith = require('gulp-spritesmith');

// Таск для сборки Gulp файлов
gulp.task('pug', function(callback) {
	return gulp.src('./src/template/index.pug')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Pug',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe( pug({
			pretty: true
		}) )
		.pipe( gulp.dest('./build/') )
		.pipe( browserSync.stream() )
	callback();
});

// Таск для компиляции SCSS в CSS
gulp.task('scss', function(callback) {
	return gulp.src('./src/scss/style.scss')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Styles',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
        .pipe( gulp.dest('./build/css/') )
        .pipe(clean_css())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(gulp.dest('./build/css/'))
		.pipe( browserSync.stream() )
	callback();
});

gulp.task('js', function(callback) {
	return gulp.src('./src/js/script.js')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'JS',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe(fileinclude())
		.pipe(gulp.dest('./build/js/'))
		.pipe(
			uglify()
		)
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(gulp.dest('./build/js/'))
		.pipe( browserSync.stream() )
	callback();
});

// Копирование Изображений
gulp.task('copy:img', function(callback) {
	return gulp.src('./src/img/**/*.*')
	  .pipe(gulp.dest('./build/img/'))
	callback();
});

// Копирование Fonts
gulp.task('copy:fonts', function(callback) {
	return gulp.src('./src/fonts/**/*.*')
	  .pipe(gulp.dest('./build/fonts/'))
	callback();
});

/* ------------ Sprite ------------- */
gulp.task('sprite', function(cb) {
    const spriteData = gulp.src('source/img/icons/*.png').pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: '../img/sprite.png',
      cssName: 'sprite.scss'
    }));
  
    spriteData.img.pipe(gulp.dest('build/img/'));
    spriteData.css.pipe(gulp.dest('src/scss/global/'));
    cb();
  });

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function() {

	// Следим за картинками и скриптами и обновляем браузер
	watch( ['./build/fonts/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload) );

	// Запуск слежения и компиляции SCSS с задержкой
	watch('./src/scss/**/*.scss', gulp.parallel('scss'))
	

	// Слежение за PUG и сборка
    watch('./src/pug/**/*.pug', gulp.parallel('pug'))

    // Слежение за JS
    watch('./src/js/**/*.*', gulp.parallel('js'))

	// Следим за картинками и скриптами, и копируем их в build
	watch('./src/img/**/*.*', gulp.parallel('copy:img'))
	watch('./src/fonts/**/*.*', gulp.parallel('copy:fonts'))

});

// Задача для старта сервера из папки app
gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: "./build/"
		}
	})
});

gulp.task('clean:build', function() {
	return del('./build')
});

// Дефолтный таск (задача по умолчанию)
// Запускаем одновременно задачи server и watch
gulp.task(
		'default', 
		gulp.series( 
			gulp.parallel('clean:build'),
			gulp.parallel('scss', 'pug', 'copy:img', 'copy:fonts'), 
			gulp.parallel('server', 'watch'), 
			)
	);
