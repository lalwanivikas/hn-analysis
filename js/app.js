'use strict;'

var $submissions = document.getElementById('numberOfSubmissions');
var $numberOfStories = document.getElementById('numberOfStories');
var $numberOfComments = document.getElementById('numberOfComments');

var $preChart = document.getElementById('preChart');
var $chartDiv = document.getElementById('chartDiv');

var baseUrl =  "https://hacker-news.firebaseio.com/v0/item/";
var storiesToAnalyse, maxItem, numberOfStories = 0, numberOfComments = 0, requestCount = 0, steps;

//sets initial values for hourly stories and comments array
var hourlyStories = [], hourlyComments = [], hourlyLabels = [];
for(var i = 0; i < 24; i++) {
	hourlyStories[i] = 0;
	hourlyComments[i] = 0;
	hourlyLabels[i] = i;
}

//gets current running maximum item count
function latestItem() {
	var maxItemUrl = "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"; 

	var maxReq = new XMLHttpRequest();
	maxReq.onreadystatechange = function(){
		if(maxReq.readyState === 4 && maxReq.status === 200) {
			maxItem = JSON.parse(maxReq.responseText);
		}
	}
	maxReq.open('GET', maxItemUrl, true);
	maxReq.send();																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																
}
latestItem();

//starts analysis on form submission
document.querySelector('form').addEventListener('submit', function(e){
	
	// prevents page reload(default behaviour of submit) 
	e.preventDefault();
	
	$preChart.style.display = "block";

	while ($chartDiv.firstChild) {
    	$chartDiv.removeChild($chartDiv.firstChild);
	}
	// resets counters on form submission
	numberOfStories = 0; 
	numberOfComments = 0;
	requestCount = 0;

	if($submissions.value <= 1000) {
		storiesToAnalyse = $submissions.value;
	} else {
		storiesToAnalyse = 1000;
	}

	var url = baseUrl + (maxItem - storiesToAnalyse) + ".json?print=pretty";

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4 && xhr.status === 200) {
			var startingItem = JSON.parse(xhr.responseText);
			var startingId = startingItem.id;

			for(var i = startingId; i < maxItem; i++) {
				var submissionTime = getTime(i);
			}
		}
	};
	xhr.open('GET', url, true);
	xhr.send();
});

function getTime(id){
	var timeUrl = baseUrl + id + ".json?print=pretty";
	var timeXhr = new XMLHttpRequest();	

	timeXhr.onreadystatechange = function(){

		if(timeXhr.readyState === 4){
			
			requestCount++; //updating request counter - will be used to update chart
			
			if(timeXhr.status === 200) {
				
				var submission = JSON.parse(timeXhr.responseText);
				
				if(submission.type === "story"){
					numberOfStories += 1;
					var storyTime = submission.time * 1000;
					var storyDate = new Date(storyTime);
					var storyDay = storyDate.getHours();
					hourlyStories[storyDay] = numberOfStories;				
				}
				$numberOfStories.innerHTML = "Number of Stories: " + "<span class='number'>" + numberOfStories + "</span>";

				if(submission.type === "comment"){
					numberOfComments += 1;
					var commentTime = submission.time * 1000;
					var commentDate = new Date(commentTime);
					var commentDay = commentDate.getHours();
					hourlyComments[commentDay] = numberOfComments;				
				}
				$numberOfComments.innerHTML = "Number of Comments: " + "<span class='number'>" + numberOfComments + "</span>";
			}
			
			//once all the requests are complete this updates the chart
			if(requestCount == $submissions.value) {
				
				// Chart Data and Options
				steps = Math.max(...hourlyComments);
				var data = {
				    labels: hourlyLabels,   
				    datasets: [
				        {
				            label: "Stories",
				            fillColor: "rgba(220,220,220,0.2)",
				            strokeColor: "rgba(220,220,220,1)",
				            pointColor: "rgba(220,220,220,1)",
				            pointStrokeColor: "#fff",
				            pointHighlightFill: "#fff",
				            pointHighlightStroke: "rgba(220,220,220,1)",
				            data: hourlyStories
				        },
				        {
				            label: "Comments",
				            fillColor: "rgba(151,187,205,0.2)",
				            strokeColor: "rgba(151,187,205,1)",
				            pointColor: "rgba(151,187,205,1)",
				            pointStrokeColor: "#fff",
				            pointHighlightFill: "#fff",
				            pointHighlightStroke: "rgba(151,187,205,1)",
				            data: hourlyComments
				        }
				    ]
				};

				var options = {
					scaleIntegersOnly: false,
					bezierCurve: false,
					legendTemplate : '<ul>'
				                  +'<% for (var i=0; i < datasets.length; i++) { %>'
				                    +'<li>'
				                    +'<span style=\"background-color:<%=datasets[i].pointColor%>\"></span>'
				                    +'<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>'
				                  +'</li>'
				                +'<% } %>'
				              +'</ul>',
				    scaleOverride: true, 
				    scaleStartValue: 0, 
				    scaleStepWidth: steps, 
				    scaleSteps: Math.ceil((Math.max(...hourlyComments) * 2) / steps)
				};
				
				$preChart.style.display = "none";
				$chartDiv.style.display = "block";

				//creating canvas for drawing chart
				var canvas = document.createElement('canvas');
				canvas.setAttribute('id', 'myChart');
				canvas.setAttribute('width', '900');
				canvas.setAttribute('height', '400');
				$chartDiv.appendChild(canvas);
				
				//creating legend for chart
				var legend = document.createElement('div');
				legend.setAttribute('id', 'legendDiv');
				$chartDiv.appendChild(legend);

				// Get the context of the canvas element we want to select
				var ctx = canvas.getContext("2d");
				var myLineChart = new Chart(ctx).Line(data, options);
				document.getElementById("legendDiv").innerHTML = myLineChart.generateLegend();
			}
		}
	}
	timeXhr.open('GET', timeUrl, true);
	timeXhr.send();
}