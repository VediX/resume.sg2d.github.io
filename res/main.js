//
fetch("/README.md").then(async function(response) {
	var converter = new showdown.Converter();
	var text = await response.text();
	var html = converter.makeHtml(text);
	document.querySelector("#markdown_content").innerHTML = html;
});


/*var converter = new showdown.Converter();

let config = [
 {name: "omitExtraWLInCodeBlocks", value: true},
 {name: "noHeaderId", value: false},
 {name: "parseImgDimensions", value: true},
 {name: "simplifiedAutoLink", value: true},
 {name: "literalMidWordUnderscores", value: true},
 {name: "strikethrough", value: true},
 {name: "tables", value: true},
 {name: "tablesHeaderId", value: false},
 {name: "ghCodeBlocks", value: true},
 {name: "tasklists", value: true},
 {name: "smoothLivePreview", value: true},
 {name: "prefixHeaderId", value: false},
 {name: "disableForced4SpacesIndentedSublists", value: false},
 {name: "ghCompatibleHeaderId", value: true},
 {name: "smartIndentationFix", value: false},
 {name: "rawPrefixHeaderId", value: false},
 {name: "rawHeaderId", value: false},
 {name: "literalMidWordAsterisks", value: false},
 {name: "simpleLineBreaks", value: false},
 {name: "requireSpaceBeforeHeadingText", value: false},
 {name: "ghMentions", value: false},
 {name: "encodeEmails", value: true},
 {name: "openLinksInNewWindow", value: false},
 {name: "backslashEscapesHTMLTags", value: false},
 {name: "emoji", value: false},
 {name: "underline", value: false},
 {name: "completeHTMLDocument", value: false},
 {name: "metadata", value: false},
 {name: "splitAdjacentBlockquotes", value: false}
];
for (var i = 0; i < config.length; i++) {
	converter.setOption(config[i].name, config[i].value);
}
var text = document.querySelector("#markdown_content").innerHTML;
var html = converter.makeHtml(text);
document.querySelector("#markdown_content").innerHTML = html;*/