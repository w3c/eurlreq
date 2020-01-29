var owner = 'w3c';

var sections = {}
var debug = true

var issues = []
var maxpages = 5

var totals=0
var counter=maxpages
			
function getAllData () {
	for (var p=1;p<maxpages+1;p++) fetchIssues(p)
	var timer = setInterval(function() {
		if (counter === 0) {
			clearInterval(timer)
			if (debug) console.log('finished','Issue length:',issues.length, sections)

			// group issues by label, adding to the labels array
			for (var i=0; i<issues.length; i++) {
				if (issues[i].labels) {
					for (var l=0;l<issues[i].labels.length;l++) { // for each label in that issue
						if (issues[i].labels[l].name.startsWith('i:')) {
							sLabelFound = issues[i].labels[l].name.replace(/^i:/,'')
							if (sections[sLabelFound]) sections[sLabelFound].push(issues[i])
							else {
								sections[sLabelFound] = []
								sections[sLabelFound].push(issues[i])
								}
							if (debug) console.log(sLabelFound)
							}
						}
					}
				}
			buildDoc()
			}
		else if (debug) console.log(counter)
		}, 50)
	}

	
// Grab and present the issue list from GitHub
function fetchIssues(page) {
	var request = new XMLHttpRequest();
	request.open('get','https://api.github.com/repos/w3c/eurlreq/issues?per_page=100&page='+page)
	request.onload = function () {
			var temp = JSON.parse(request.responseText)
			for (var i=0;i<temp.length;i++) {
				issues.push(temp[i])
				}
		totals += issues.length;
		if (debug) console.log(issues.length,totals,page, counter)
		counter--
		}
	request.send();
	}
				


function buildDoc () {
	// incorporate the information in the database into the html document


	if (sections.transforming_characters) buildSection(sections.transforming_characters,'transforms')
	if (sections.quotations) buildSection(sections.quotations,'quotations')

	if (sections.hyphenation) buildSection(sections.hyphenation,'hyphenation')
	if (sections.text_align_justification) buildSection(sections.text_align_justification,'justification')
	if (sections.letter_spacing) buildSection(sections.letter_spacing,'spacing')
	if (sections.styling_initials) buildSection(sections.styling_initials,'initials')
}


function buildSection (theData, sectionId) {
	var labelSet = new Set([])
	var out = ''
	for (let i=0;i<theData.length;i++) {

		// find script labels
		for (l=0;l<theData[i].labels.length;l++) {
			labelSet.add(theData[i].labels[l].name)
			}
		console.log('labelSet:',labelSet)
		
		// screen out issues that don't relate to the current gap-analysis document
		rightDoc = false
		for (l=0;l<theData[i].labels.length;l++) {
			if (theData[i].labels[l].name === window.gapDocLabel) rightDoc = true
			}
		console.log('rightDoc:',rightDoc)
		
		if (rightDoc) {

			out += '<h4>#'+theData[i].number+' '+theData[i].title+'</h4>\n'
			out += '<p>'

			var body = theData[i].body

			// create html links
			function convert(str, p1, p2, s) {
				return '<a href="'+p2+'">'+p1+'</a>'
				}
			var test = /\[([^\]]+)\]\(([^\)]+)\)/g
			body = body.replace(test, convert)

			// split into paragraphs
			out += body.replace(/\r\n\r\n/g,'</p><p>')
			out += '</p>\n'
			}
		}
	document.getElementById(sectionId+'Insert').innerHTML = out

	// figure out priority for section
	if (labelSet.has('p:basic')) var priority = 'basic'
	else if (labelSet.has('p:advanced')) priority = 'advanced'
	else priority = 'ok'
	document.getElementById(sectionId).className = priority
	}









