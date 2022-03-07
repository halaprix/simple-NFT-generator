Previously part of https://github.com/metaplex-foundation/metaplex

## Creating generative art

0. run `yarn install` in the root folder.
1. Create a `traits` folder and create a list of directories for the traits (i.e. background, shirt, sunglasses). Look at the `example-traits` for guidance
2. Run the following command to create a configuration file called `traits-configuration.json`:
   NOTE: The <directory> should be point to your traits folder you created in step 1

```

ts-node cli generate_art_configurations <directory>

```

The following file will be generated (based off of `example-traits`):

```json
{
  "name": "",
  "symbol": "",
  "description": "",
  "creators": [],
  "collection": {},
  "premadeCustoms": [
    {
      "background": "blue.png",
      "eyes": "egg-eyes.png",
      "face": "cyan-face.png",
      "mouth": "block-mouth.png"
    },
    {
      "background": "red.png",
      "eyes": "egg-eyes.png",
      "face": "cyan-face.png",
      "mouth": "block-mouth.png"
    }
  ],
  "dnp": {
    "background": {
      "blue.png": {
        "eyes": ["egg-eyes.png", "heart-eyes.png"]
      }
    }
  },
  "breakdown": {
    "background": {
      "blue.png": 0.04,
      "brown.png": 0.04,
      "flesh.png": 0.05,
      "green.png": 0.02,
      "light-blue.png": 0.06,
      "light-green.png": 0.01,
      "light-pink.png": 0.07,
      "light-purple.png": 0.05,
      "light-yellow.png": 0.06,
      "orange.png": 0.07,
      "pink.png": 0.02,
      "purple.png": 0.03,
      "red.png": 0.05,
      "yellow.png": 0.43
    },
    "eyes": {
      "egg-eyes.png": 0.3,
      "heart-eyes.png": 0.12,
      "square-eyes.png": 0.02,
      "star-eyes.png": 0.56
    },
    "face": {
      "cyan-face.png": {
        "baseValue": 0.07,
        "background": {
          "blue.png": 0.9,
          "brown.png": 0.1
        }
      },
      "dark-green-face.png": 0.04,
      "flesh-face.png": 0.03,
      "gold-face.png": 0.11,
      "grapefruit-face.png": 0.07,
      "green-face.png": 0.05,
      "pink-face.png": 0.05,
      "purple-face.png": 0.02,
      "sun-face.png": 0.1,
      "teal-face.png": 0.46
    },
    "mouth": {
      "block-mouth.png": 0.23,
      "smile-mouth.png": 0.09,
      "triangle-mouth.png": 0.68
    }
  },
  "order": ["background", "face", "eyes", "mouth"],
  "width": 1000,
  "height": 1000
}
```

3. Go through and customize the fields in the `traits-configuration.json`, such as `name`, `symbol`, `description`, `creators`, `collection`, `width`, and `height`.
4. After you have adjusted the configurations to your heart's content, you can run the following command to generate the JSON files along with the images.

```
ts-node cli create_generative_art -c <configuration_file_location> -n <number_of_images>
```

5. This will create an `assets` folder, with a set of the JSON and PNG files to make it work!

6. Note: Need to use a PSD instead of pngs? That's fine. You can have a PSD with two levels of layers - a top level like HEAD and then sublevel like "White Hat", "Black Hat", etc. Then you can create a traits
   configuration where the hash of each feature is named "HEAD" and then each layer shows up as a key with
   a probability, instead of PNGs. Then you can use the -o ability of the create_generative_art app
   to output just JSON files to the assets folder AND a whole array of arrays json to be used by the psd_layer_generator.py app to actually generate the images.

NOTE: Do not forget that "No Traits" is a special reserved key for this app.

To use the psd_layer_generator, do:

```
python psd_layer_generator.py -p ./traits.psd -o assets/ -t sets.json -e "FINISHERS" -n 0
```

Where sets is your output from the create generate command, and -e is an optional layer you toggle to true
for every item. You may need this if you have extra finishing touches.

Remember with PSDs, for each layer folder to have a dummy trait at the top, or else the top layers won't render. [UNDISCLOSED BUG IN PSD READER]
Also with PSDs, make sure your default visible layer is at the bottom of the folder. Another bug.
