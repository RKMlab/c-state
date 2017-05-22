# C-State

## About

C-State (**'C'** the **C**hromatin **State**) is a webapp written using [VueJS](https://vuejs.org/) and [d3.js](https://d3js.org/) for epigenetic data visualization by biologists. It runs on all web browsers out of the box, and needs minimal user intervention. With C-State you can:

+ Automatically retrieve and display data relevant to your interest from whole-genome datasets
+ Simultaneously visualize multiple genes/genomic loci across chromosomes
+ Identify and filter genes based on user-defined search parameters
+ Compare epigenetic profile of gene subsets across multiple cell types and/or experimental conditions
+ Generate high quality gene-centric images documenting chromatin State

So far, C-State relied on users having a pre-defined gene list of interest. This version aims to change that by allowing users to upload and analyze all the genes of a given genome. In addition, many technical changes have been made, such as:

+ The CSS framework is changed from Bootstrap to [Element](http://element.eleme.io/#/en-US)
+ Single Page `.vue` components for easier separation of concerns
+ App structure similar to npm packages
+ Webpack driven development and production environment
+ Hot reloading


## Download
``` bash
git clone https://github.com/RKMlab/c-state.git
```

## Install
``` bash
# Install necessary npm packages
cd c-state
git checkout new
npm install
```

## Develop
``` bash
# Serve with hot-reload at localhost:8080
npm run dev
```

## Build
``` bash
# Build for production with minification
npm run build
```

For alternate versions and a live demo, please visit our [homepage](http://www.ccmb.res.in/rakeshmishra/c-state/).

## Manual
For detailed usage instructions, please visit the [C-State website](http://www.ccmb.res.in/rakeshmishra/c-state/)

## Contact
If you have any queries or suggestions regarding C-State, please contact:

Divya Tej Sowpati:  tej@ccmb.res.in<br>
Surabhi Srivastava: ssurabhi@ccmb.res.in