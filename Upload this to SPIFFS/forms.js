window.onload = function() {
	if (!window.jQuery){  
		document.getElementById("loading").style.display = "none";
		document.getElementById("header").style.display = "block";
	}

	// If browser is not Android, convert clickable submenu into hover submenu
	var ua = navigator.userAgent.toLowerCase();
	var isAndroid = ua.indexOf("android") > -1;
	if(!isAndroid){
		var sheet = document.createElement("style")		
		sheet.innerHTML = ".dropdown-submenu:hover>.dropdown-menu { display: block; }";
		document.body.appendChild(sheet);
	}
}

// Jquery functions
function startup(formname, url) {
  return function() {
	var WaitForReboot = 0;
	setInterval(CheckReboot, 2000);

	// Make submenu clickable
	$(".dropdown-submenu>a").unbind("click").click(function(e){
		$(this).next("ul").toggle();
		e.stopPropagation();
		e.preventDefault();
	});
	// Allways start with 'RefreshData' to collect data with JQuery
	// When finished, show full page
	RefreshData();
	$("#header").show();
	$("#loading").hide();
	$("#" + formname).show();


    RefreshData;

	// Function to submit (save) form data to ESP. Depending on the settings the ESP might reboot, then we have to trigger the CheckReboot function
	$("#" + formname).submit(function(event) {
		event.preventDefault();
		$("#" + formname).hide();
		$("#header").hide();
		$("#saving").show();
		var values = $(this).serialize();
		$.ajax
		({
			url: "/" + url,
			type: "post",
			data: values,
			success: function(html)
			{
				$("#saving").hide();
				$("#reboot").show();
				WaitForReboot = 1;
			}
		});
	});
	
	// Function to send Reboot command to ESP and wait to come back online. Triggered after pushing the red 'Reboot' button from the modal popup
	function DoReboot(){
		$("#header").hide();
		$("#" + formname).hide();
		$("#reboot").show();
		WaitForReboot = 1;
		$.ajax
		({type: "GET",url: "/api",data: {action:"reboot",value:"true"},cache: false})
	};

	// Function send Reset command (clear EEPROM) to ESP. Triggered after pushing the red 'Reset' button from the modal popup
	function DoReset(){
		$("#header").hide();
		$("#" + formname).hide();
		$("#reboot").show();
		WaitForReboot = 1;
		$.ajax
		({type: "GET",url: "/api",data: {action:"reset",value:"true"},cache: false})
	};

	// When a link to the modal-dialog is pressed, configure text and buttons. This is for reset
	$("#DoReset").click(function(event){
		event.preventDefault();
		$(".modal-title1").html("Confirm factory reset");
		$("#modal-body-text").html("Are you sure you want to reset?<br>This will erase all settings, including wifi. This option is irreversible.");
		$("#DoFunction").html("Reset");
		$("#DoFunction").attr("title", "DoReset");
	});

	// When a link to the modal-dialog is pressed, configure text and buttons. This is for reboot
	$("#DoReboot").click(function(event){
		event.preventDefault();
		$(".modal-title1").html("Confirm Reboot");
		$("#modal-body-text").html("Are you sure yout want to reboot?");
		$("#DoFunction").html("Reboot");
		$("#DoFunction").attr("title", "DoReboot");
	});
	
	// Function to figure out what exactly is confirmed in the modal-dialog, redirect to corresponding function
	$("#DoFunction").click(function(){
		$("#modal-dialog").modal("hide");
		var linkTitle = $("#DoFunction").attr("title");
		if (linkTitle == "DoReboot") { DoReboot(); }
		if (linkTitle == "DoReset") { DoReset(); }
	});

	// When the 'Refresh' button is pressed, refresh all data from ESP
	$("#refresh").click(function(){RefreshData();});
	
	// Function to poll the ESP after a reboot command. Should Refresh data when back online again and disable polling
	function CheckReboot(){
		if (WaitForReboot == 1)
		{$.ajax({url: "/ping",type: "GET",data: "",success: function(html)
			{
				WaitForReboot = 0;
				$("#loading").show();
				$("#reboot").hide();
				RefreshData();
				$("#loading").hide();
				$("#header").show();
				$("#" + formname).show();
			}
			});	
		}
	};
};
};
