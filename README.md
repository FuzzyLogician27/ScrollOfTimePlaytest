# Scroll of Time Playtest System

![Foundry v11](https://img.shields.io/badge/foundry-v11-green)

This system is a FoundryVTT intedration built from the [Boilerplate system](https://foundryvtt.wiki/en/development/guides/SD-tutorial) for FoundryVTT. It utilises Javascript and custom html and css to create dynamic character sheets that automate some of the system's rules for ease of use.

## Usage

If you have the FoundryVTT program installed and intend to GM this system, download these files and place them under `../Data/systems/SoTP.` After reloading Foundry, you should see this system in your list of installed systems, and can then create Worlds utilising the system.

This system is somewhat compatible with the Drag Ruler module. To set it up, first install and enable the module in the world that you wish to use it in, then go to module settings, open up the Speed Provider Settings, input the Speed Attribute as `actor.data.system.speed.value`, and set the Dash Multiplier to 0.5. Colour the Walk and Run rulers to taste.

## A Note From The Author On Intent

This is still a work in progress, and is currently intended to be rapidly iterable upon rather than completely automated. In the future, once the rules of the system are more finalised (after more playtesting) automation and overall elegance will become a greater priority. Additionally, this is my first foray into more complex css, html, and Javascript, so it is a learning experience!

## Sheet Layout

This system includes a handful of helper CSS classes to help you lay out your sheets if you're not comfortable diving into CSS fully. Those are:

* `flexcol`: Included by Foundry itself, this lays out the child elements of whatever element you place this on vertically.
* `flexrow`: Included by Foundry itself, this lays out the child elements of whatever element you place this on horizontally.
* `flex-center`: When used on something that's using flexrow or flexcol, this will center the items and text.
* `flex-between`: When used on something that's using flexrow or flexcol, this will attempt to place space between the items. Similar to "justify" in word processors.
* `flex-group-center`: Add a border, padding, and center all items.
* `flex-group-left`: Add a border, padding, and left align all items.
* `flex-group-right`: Add a border, padding, and right align all items.
* `grid`: When combined with the `grid-Ncol` classes, this will lay out child elements in a grid.
* `grid-Ncol`: Replace `N` with any number from 1-12, such as `grid-3col`. When combined with `grid`, this will layout child elements in a grid with a number of columns equal to the number specified.

## Editing and Compiling the CSS

This repo includes both CSS for the theme and SCSS source files. If you're new to CSS, it's probably easier to just work in those files directly and delete the SCSS directory. If you're interested in using a CSS preprocessor to add support for nesting, variables, and more, you can run `npm install` in this directory to install the dependencies for the scss compiler. After that, just run `npm run gulp` to compile the SCSS and start a process that watches for new changes.

![image](http://mattsmith.in/images/boilerplate.png)
