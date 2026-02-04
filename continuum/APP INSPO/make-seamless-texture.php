<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="description" content="Сделать бесшовную текстуру из фото онлайн. Опционально можно выбрать способ создания бесшовной текстуры, выровнять яркостные переходы текстуры, обрезать не нужные края для достижения наилучшего результата.">
<meta name="keywords" content="текстура, бесшовная, сделать, создать, онлайн">
<link rel="stylesheet" type="text/css" href="design.css">
<link rel="shortcut icon" href="/favicon.ico">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="alternate" hreflang="ru" href="https://www.imgonline.com.ua/make-seamless-texture.php">
<link rel="alternate" hreflang="en" href="https://www.imgonline.com.ua/eng/make-seamless-texture.php">
<title>Сделать бесшовную текстуру онлайн - IMG online</title>
</head>
<body>
<div id="page">
<div id="logo">IMGonline.com.ua</div>
<div id="wtf">Обработка JPEG фотографий онлайн.</div>
<div id="menu">
<a href="/">Главная</a> |
<a href="resize-image.php">Изменить размер</a> |
<a href="convert.php">Конвертер</a> |
<a href="compress-image.php">Сжать</a> |
<a href="exif.php">Редактор EXIF</a> |
<a href="effects.php">Эффекты</a> |
<a href="photo-improvements.php">Улучшить</a> |
<a href="tools.php">Инструменты</a>
</div>

<div id="content">
<script src="advertising.js"></script>
<script src="artdc.js"></script>
<h1>Сделать бесшовную текстуру онлайн</h1>

<p>Главное нужно указать файл картинки или текстуры в формате jpg на вашем компьютере или телефоне, нажать кнопку ОК внизу. Остальные настройки выставлены по умолчанию.</p>

<p>Пример тайлинга (<a href="check-texture-tiling.php" title="Проверка бесшовности текстуры онлайн">плитки</a> или стыковки) обычной фотографии земли без изменений (хорошо видны швы) и бесшовная текстура земли после автоматической обработки на этом сайте. В настройках предварительного выравнивания тёмных и светлых участков была указана &laquo;<b>интенсивность 20</b>&raquo;, остальные настройки были выставлены по умолчанию:<br>
<img src="examples/texture-ground-tile-original.jpg" width="350" height="350" alt="Фото земли, чернозём">
<img src="examples/texture-ground-seamless.jpg" width="350" height="350" alt="Бесшовная текстура земли, чернозёма">
</p>

<p>Пример тайлинга фотографии травы без изменений и бесшовная текстура травы, созданная <b>способом № 4-Б</b>, в выравнивании тёмных и светлых участков изображения указана &laquo;<b>интенсивность 30</b>&raquo;, остальное без изменений:<br>
<img src="examples/texture-grass-tile-original.jpg" width="350" height="261" alt="Фото зелёной травы">
<img src="examples/texture-grass-seamless.jpg" width="350" height="261" alt="Бесшовная текстура травы после обработки">
</p>

<p>Исходное изображение никак не изменяется. Вам будет предоставлена обработанная текстура и проверочная плитка.</p>

<div id="rtop">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7114716596087124"
     crossorigin="anonymous"></script>
<!-- imgonl_adapt_top -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7114716596087124"
     data-ad-slot="8592316491"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script></div>

<form action="make-seamless-texture-result.php" method="post" enctype="multipart/form-data">

<div class="ramka">
1) <b>Укажите изображение в формате BMP, GIF, JPEG, PNG, TIFF:</b><br><br>
<input type="file" name="uploadfile" size="20" style="font-size:14px; height:32px; width:50%;">
</div>

<div class="ramka">
2) <b>Настройки для создания бесшовной текстуры</b><br>
<hr>
Способ создания бесшовной текстуры: 
<select name="efset3" size="1" style="width:179px;">
<option value="1">№1 (сглаженный коллаж)</option>
<option value="2" selected="selected">№2 (рассеянные края)</option>
<option value="6">№3 (сглаженные копии всех сторон)</option>
<option value="3">№4 (восстанавливающая рамка)</option>
<option value="4">№4-А (в основном для мелких камней)</option>
<option value="5">№4-Б (предпочтительно для травы)</option>
</select> (лучшие &ndash; это 2-й и 3-й способ)

<hr>

<span style="display:inline-block;margin-bottom:6px;">Формат плитки для проверки бесшовности: 
<select name="efset4" size="1" style="width:56px;">
<option value="1" selected="selected">2x2</option>
<option value="2">2x1</option>
<option value="3">1x2</option>
<option value="4">не создавать проверочную плитку</option>
</select> (будет в отдельном файле)</span>

<br>

Обозначить швы, места стыковки текстуры: 
<select name="efset6" size="1" style="width:106px;">
<option value="1">красным цветом</option>
<option value="2">синим цветом</option>
<option value="3">зелёным цветом</option>
<option value="4" selected="selected">отключено</option>
</select> (для проверочной плитки)
<hr>
</div>


<div class="ramka">
3) Дополнительные настройки<br>
<hr>
<span style="display:inline-block;margin-bottom:6px;">Предварительная обрезка изображения в пикселях:</span>
<br>
Слева: <input type="number" name="cropleft" value="0" min="0" max="20000" style="width:50px;"> &nbsp;
Сверху: <input type="number" name="croptop" value="0" min="0" max="20000" style="width:50px;"> &nbsp;
Снизу: <input type="number" name="cropbottom" value="0" min="0" max="20000" style="width:50px;"> &nbsp;
Справа: <input type="number" name="cropright" value="0" min="0" max="20000" style="width:50px;">
<hr>
<span style="display:inline-block;margin-bottom:6px;">Предварительное выравнивание тёмных и светлых участков изображения:</span>
<br>
Интенсивность: <input type="number" name="efset2" value="0" min="0" max="100" style="width:50px;"> (от 0 до 100, 0=&quot;отключено&quot;)&nbsp;
Радиус: <input type="number" name="efset" value="5" min="1" max="20" style="width:50px;"> (1-20)
<hr>
</div>


<div class="ramka">
4) Формат изображения на выходе<br>
<hr>
<input type="radio" name="outformat" value="2" checked="checked">JPEG 
<select name="jpegtype" size="1" style="width:120px;">
<option value="1" selected="selected">cтандартный</option>
<option value="2">прогрессивный</option>
</select> с качеством <input type="number" name="jpegqual" value="92" min="1" max="100" style="width:50px;"> (от 1 до 100)
<br>
<input type="radio" name="outformat" value="3">PNG-24 (без сжатия и без потери качества)
<hr>
</div>

<div class="ramka">
<input type="submit" value="OK" style="width:250px;height:40px;font-size:20px;text-align:center;">
<br>&nbsp;&nbsp;<span style="font-size: 12px;">Обработка обычно длится 5-40 секунд.</span>
</div>
</form>

<div id="rbottom">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7114716596087124"
     crossorigin="anonymous"></script>
<!-- imgonl_adapt_bottom -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7114716596087124"
     data-ad-slot="2545782895"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script></div>

</div>

<div id="pf"><a href="contact.php">Связь</a> | <a href="sitemap.php">Карта сайта, ограничения</a> | <a href="eng/make-seamless-texture.php">English version</a></div>
<div id="co">&copy; 2018 www.imgonline.com.ua</div>
</div>
</body>
</html>
