# C-State
'C' the chromatin state
<div>
<h2 class="section-title text-center wow fadeInDown">Manual</h2>
                <h4><b>Launching C-State</b></h4>
<p>Download the appropriate version of C-State (see FAQs) and extract the zip file with any compression utility. <br>
Contents of C-State folder:
<ul>
<li>Icon for launching C-State (only in version with hosting script)</li>
<li>Miniweb.exe file (only in version with hosting script)</li>
<li>app subfolder – contains all scripts necessary for C-State to run</li>
<li>examples subfolder – contains test data that can be used to run C-State straight-away</li>
<li>ReadMe (Manual)</li>
<li>License</li>
</ul>
</p>
To Launch C-State:<br>
<p>
<b>For Windows only:</b> If you downloaded the version with hosting script, double-clicking the run_c-state.bat file will host and open C-State in a single go. <br>
If you downloaded the version without the hosting script, open the C-State folder and browse to app sub-folder. Go to the explorer bar, type cmd and press Enter to open a command prompt in that folder. To start a static web server, type:<br>
<b>Python 2: </b><code>python –m SimpleHTTPServer</code><br>
<b>Python 3: </b><code>python –m http.server</code><br>
<b>PHP: </b><code>php –S localhost:8000</code><br>
</p>
<p>
<b>For Mac:</b> Open a Terminal window (either from Utilities, or by searching in Finder). To browse to the C-State app folder, type <code>cd</code> and drag-drop the app sub-folder of C-State into the Terminal window. You should now see the path of C-State app folder pasted in the Terminal. Press Enter to navigate to that directory in Terminal. OSX installations come with Python 2 by default, and you can use the command <code>python –m SimpleHTTPServer</code> to start a webserver. If you are unsure of your python version, you can type <code>python –V</code> and press Enter to check the python version. Once confirming the python version, you can use the appropriate command as listed above.
</p>
<p>
<b>Linux</b> users should know their stuff. Host a webserver in the C-State app sub-directory and point your browser to localhost.</p>
<p>
For a comprehensive list of ways to host static servers, you can check this <a href="https://gist.github.com/willurd/5720255" target="_blank">page</a> <br>
Once the webserver starts, you can access C-State by opening your browser and going to <a href="http://localhost:8000" target="_blank">http://localhost:8000</a><br>
Once C-State is launched in the browser window, you should see a page with three accordions, with the first accordion expanded, as seen in the figure below.
</p>
<p align="center">
<img src="images/Slide1.png" class="img-responsive">
</p>

<p><b>Note:</b> C-State works best in Google Chrome, where it has been extensively tested, although it should run on any browser (Mozilla firefox, IE, Microsoft Edge, Safari) without any issues</p>
<h4><b>Loading files into C-State</b></h4>
<p>Upload files via the Files accordion<br>
<b>Note:</b> If you have used C-State before and want to plot the same data again, you can directly proceed to step 7. If you already have the genomic coordinates of your genes of interest in BED format, proceed to step 2 directly<br><br>
1. Load a list of gene identifiers as a text file (Official Gene Symbols, RefSeq IDs etc.) via the "Load Genes List" button. Choose the appropriate genome and gene identifier from the drop-down menus and use the "Create BED file" button (highlighted with a red box in the picture below).
This step retrieves the BED information of your genes of interest, and prompts you to save the 'genes.bed’ file. We recommend saving this file in the same folder where rest of the processed C-State files will be saved in subsequent steps. 
<p align="center">
<img src="images/Slide2.png" class="img-responsive">
</p>

2. Load the genes.bed file into C-State using the "Load Genes" button (highlighted in the pic below). In case users have their own BED files with the relevant gene information (or in case working with a genome not currently pre-loaded into C-State), they can skip step 1 and directly load the BED file here.
<p align="center">
<img src="images/Slide3.png" class="img-responsive">
</p>

3. Select region flanks using the flank selector provided next to the "Load Genes" button. This specifies the extent of genomic region to be visualized around the target gene body.  The default is set to 20 kb.
Alternatively, customized regions around each of the genes can be provided as co-ordinates in BED format and uploaded via the "Load Regions" button.<br>
4. Load features files via the "Load Features" button (red box in pic below) by selecting all the data files of a cell type together. Features file can comprise any coordinate based information that you want to plot, such as histone mark peaks, transcription factor peaks etc.<br>
<b>Important:</b> Names of feature files are very crucial. C-State infers the names of features from the file names. Hence, all data belonging to a cell type or condition must have the same prefix, followed by an underscore, followed by the name of feature. Whichever name you provide here will be the name displayed when that feature is plotted in subsequent steps. For example, if you are uploading H3K4me3 and H3K9ac peaksets of HeLa cells, the feature files could be named as HeLa_H3K4me3.bed and HeLa_H3K9ac.bed respectively. Note that the files must have an extension but the actual extension is not significant.
<p align="center">
<img src="images/Slide4.png" class="img-responsive">
</p>

Upload all the feature files of a cell type together at one go, and click the "Create C-State File" button (highlighted with a green box in the pic above). This extracts the relevant peak information for all target genes from the whole genome features files of a given cell type, and converts them into the gene-centric C-State format. 
A spinner indicates that the input files are being created and a save dialog box pops up once the conversion is done. 
Rename the file with cell type name as the prefix, followed by an underscore and any description you would like to give. Continuing the example from above, we could rename the converted file as HeLa_input.tsv.
Save the processed C-State file in the folder where you saved your genes.bed file.<br>
5. Repeat step 4 for the features files of other cell types or conditions you want to visualize, once for each cell type. 
Save the converted files of each cell type in the same folder, renaming each processed file as mentioned in step 4.<br>
6 (Optional). If you want to also plot any coordinate based information that is common to all cell types (such as exons, restriction sites etc.), you can convert them in the same way as features, ensuring that the files are named correctly.<br>
<b>Note:</b> If the flanking genomic regions to be viewed are changed via the flank selector, then steps 2-6 must be performed afresh so that C-State can create new processed files containing information of the changed genomic flank distance.<br>
Note that once the processed C-State input files have been created and all files saved in the processed C-State folder, steps 2-6 need not be repeated when using C-State again. Perform step 1 and move onto step 7 for subsequent viewing. <br>
7. Load the processed C-State input files, the genes.bed file and exons file (if any) together via the "Load C-State Files" button (red box in the pic below). 
<p align="center">
<img src="images/Slide5.png" class="img-responsive">
</p>

Note that all these files need to be uploaded in one go via the Load C-State files button and hence it is recommended to save all the converted files along with the genes.bed file and any exon or gene annotation file in a single folder.<br>
8. The genes of interest are displayed in the visualization pane with the details visible in the visualization tab.
<p align="center">
<img src="images/Slide6.png" class="img-responsive">
</p>

The default display is the grid view (as shown above) that simultaneously depicts all the features at the target loci across all cell types. Clicking on any gene opens an expanded modal view that utilizes the larger aspect ratio of a landscape layout to focus along the entire locus across all cell types.<br>
</p>
<h4><b>Applying filters</b></h4>
<p>The Filters accordion allows the user to search for genes containing specified patterns.<br>
<b>Gene Name Filter</b><br>
The Gene Name filter area is highlighted with a black box in the pic below. Select the "Filter by Gene Name" radio button to activate the filter. A set of gene names can be typed or pasted in the Gene Name text box for C-State to filter and display all the genes that match the given name(s). Ticking the 'Allow partial matches’ checkbox allows the user to filter all the genes which have common prefixes (eg., gene families).<br>
<b>Hint:</b> This filter could also be used to reorder gene panels in any order you like, by entering the list of gene names in the desired order.
</p>
<p align="center">
<img src="images/Slide7.png" class="img-responsive">
</p>


<b>Filter by Features</b><br>
The second filter of C-State is "Filter by Features", highlighted in the pic below. Activate the filter by selecting the radio button. Select the cell type from the drop-down menu to highlight and apply the filter settings to it.<br>
Select from a set of operators (such as equal to, greater than and less than) to find genes that carry the desired number of marks. This can be further refined by specifying the maximum distance of the marks from the TSS.
<p align="center">
<img src="images/Slide8.png" class="img-responsive">
</p>


<b>Filter by Patterns</b><br>
The final set of filters are "Filter by Patterns", as shown with a black box in the pic below. After selecting the patterns filter by clicking the radio button, choose a cell type from the drop-down menu on which the filter will be applyed.
Select the two features that are to be viewed in the context of each other from the two drop-down menus (The feature names appear automatically in the drop down menus based on the input files provided to C-State)
<p align="center">
<img src="images/Slide9.png" class="img-responsive">
</p>

<p>Define the relationship between the two features using the relation dropdown:
<ul type="none">
	<li>Upstream - The first feature is present upstream to the second feature</li>
	<li>Downstream - The first feature is present downstream to the second feature</li>
	<li>Near - The first feature can be either upstream or downstream to the second feature</li>
	<li>Overlap - The first feature overlaps the second feature</li>
</ul> 
The minimum and maximum distance allowed between the two marks can also be specified; in case of overlaps, the distance allowed between the two marks is 0 and this option gets disabled.</p>
<h4><b>Saving output</b></h4>
<p>The list of gene names that are displayed matching any of the filters can be saved as a text file using the "Export Genes" option at the right (highlighted in the pic below). This creates a report summarizing the selection parameters (where relevant) and the list of displayed genes.
</p>
<p align="center">
<img src="images/Slide10.png" class="img-responsive">
</p>
<p>Use the "Save as SVG" option for creation of high quality vector graphics. The entire set of displayed panels can be saved or selected genes can be represented and saved as a group after applying filters. The modal view can also be saved (as SVG).
Once the genes satisfying the filter criteria are saved, the user can click the "Clear Filters" button to reset all the filters and go back to the original view.
</p>
            </div>
