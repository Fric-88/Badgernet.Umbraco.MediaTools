
# Badgernet.Umbraco.MediaTools

## Enhances your Umbraco media section with additional features!

# ✨ Features

 - 📏 **Automatic Image Optimization:** Automatically downsizes and converts images to the WebP format upon upload for better performance and reduced storage usage.

 - 🧹 **Automatic Metadata remover:** Automatically removes Metadata from image files upon uploading then. 

 - 🔎 **Advanced Search:** Find images quickly by resolution, extension, name, folder, and more.

 - 📦 **Bulk Actions:** Resize, convert or download multiple images directly from the media section.

 - 🎨 **Simple Image Editor:** Edit images with basic editing functionalities without leaving the Umbraco environment.  

---

# 📢 Important notes

### When using uSync
This package will also process any images imported using the uSync import feature. Be sure to turn off the converter / resizer (via the dashboard) to prevent that. 


### Older version of Umbraco?
This package is compatible with Umbraco version 14 and newer.
If you are looking for similar functionalities for Umbraco 13, take a look at [this repository](https://github.com/Fric-88/Badgernet.Umbraco.WebPicAuto)  

---



# 🚀 Installation
Simply add the package by using dotnet add package to install the latest version:
```
dotnet add package Badgernet.Umbraco.MediaTools
```

# 🚫 Un-installation
```
dotnet remove package Badgernet.Umbraco.MediaTools
```


---

# 📈 Changelog
#### 16.0.2
- Performance improvements when manipulating images (WebAssembly)
- Custom Swagger definitions scoped to MediaTools (Thanks Bonno)
- Bumped up the Backoffice version package

#### 16.0.1
- Fixed issues with mssql when uploading images in bulk
 

#### 16.0.0
- Bumped up versions to work with Umbraco 16

---
### Important Versioning Change
#### Starting with version 16.0.0, the first number in the package version (e.g., "16.x.x") will indicate the compatible Umbraco version.

---
#### 1.1.2 (Umbraco 15)
- Resizer settings configurable per folder
- Minor UI improvements

#### 1.1.1
- Metadata viewer improvements

#### 1.1.0
- Metadata remover (upon uploading)
- Metadata Viewer 
- Performance & Memory usage improvements 
- UI improvements

#### 1.0.6
- Fix: handling of EXIF Orientation fixed
- Fix: Image-search fixed

#### Version 1.0.5
- Fix: Corrected Aspect ratio calculation

#### Version 1.0.4
- Fix: works with Umbraco > 15.1.0 

#### Version 1.0.3 
- Added simple image editor
- Minor UI fixes 

#### Version 1.0.2
- Rename image from the dashboard
- Fix: Image list updates after processing
- Fix: Images would sometimes rotate when resizing

#### Version 1.0.1
- Works with Umbraco 15

#### Version 1.0.0
- First version


---

# 🛠️ Settings
You can change settings by accessing the "Upload processing" dashboard in the Media section in backoffice. 
This package uses settings on per-user basis, settings files are stored under: "App_Plugins/Badgernet.Umbraco.MediaTools/Settings

---

# 📏 Resolution limiter

## Max width
Resizer will scale images down to fit max width value

## Max height
Resizer will scale images down to fit max height

## Ignore aspect ratio
By default, resizing will maintain image aspect ratio.

---

# ♾️ WebP Converter

### Convert mode
"Lossy" mode will produce smaller file size images. <- this is the preferred / default mode  \
"Lossless" mode will produce better quality images.

### Convert quality
Quality of conversion, lower value will produce smaller file size images but image quality will also be worse.

### Keep original images
If turned on, original images will not be deleted

### Ignore keyword
Any images containing this keyword in its filename will be ignored by this package. -> "ignoreme_IMG01012024.png" would not get processed.

---
# 🧭 Disclaimer
By using this package, you acknowledge that editing images and their metadata may infringe upon the rights of the original creators, especially if the images are copyrighted.
Removing or altering copyright metadata without proper authorization may be illegal and violate copyright laws.
It is your responsibility to ensure that you have the necessary rights or permissions to edit the images and their metadata.
Always respect intellectual property rights and consult legal counsel if you are uncertain about the legality of your actions.
---

# 📣 Credits
Big thanks to [Kevin Jump](https://github.com/kevinjump) for providing "EarlyAdopter's Guide Umbraco v14" series on [dev.to](https://dev.to/kevinjump/series) 


