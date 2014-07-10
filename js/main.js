var ajax_url = "http://www.1minutetv.com/asocial-server/json.php";
var regex_email = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;


$(document).bind("mobileinit", function(){
	$.mobile.page.prototype.options.addBackBtn = true;
});

$( document ).on( 'pageshow', '#home', function(event) {
	
});

$( document ).on( 'pageshow', '#about', function(event) {
	$.ajax({
		url: ajax_url,
		data: {
			action: 'about'
		}
	}).done( function ( response, status ) {
		$('#page_title').html( response.post_title );
		$('#page_content').html( response.post_content );
	});
});

$( document ).on( 'pageshow', '#login', function(event) {
	$('.alert').hide();
	$("#login_submit").click( function(e) {
		var err = new Array();
		$('.alert').removeClass('error');
		$('#username_error').html('');
		$('#password_error').html('');
		e.preventDefault( );
		if( $("#login_confirm").is(":hidden") ) {
			if( !$('#username').val() )
				err['username'] = "Inserire l'indirizzo e-mail";
			else if( !regex_email.test( $('#username').val() ) )
				err['username'] = "Indirizzo e-mail non valido";
			if( !$('#password').val() )
				err['password'] = "Inserire la password";
			else if( $('#password').val().length < 8 ) {
				err['password'] = "Password troppo corta: minimo 8 caratteri";
			}
			for( i in err ) {
				$('#' + i + '_error').html(err[i]).addClass('error').slideDown( );
			}
			$('.alert:not(.error)').slideUp( );
			if( $('.alert.error' ).length == 0 ) {
				$.mobile.loading( 'show' );
				$('.alert').slideUp( );
				$.ajax({
					url: ajax_url,
					dataType: 'jsonp',
					xhrFields: {
						withCredentials: true
					},
					data: {
						action: 'login',
						username: $('#username').val(),
						pwd: $('#password').val(),
					}
				}).fail( function ( response, status, error ) {
					$('#username_error').html('E-mail o password errati').slideDown( );
					$('#password_error').html('');
					$.mobile.loading( 'hide' );
				}).done( function ( response, status ) {
					location.href = "profile.html";
				});
			}
		}
		else {
			$('.alert').slideUp( );
			$("#login_confirm").slideUp();
		}
	});
	$('#login_register').click( function(e) {
		e.preventDefault( );
		var err = new Array();
		$('.alert').removeClass('error');
		if( $('#login_confirm').is(':hidden') ) {
			$("#login_confirm").slideDown().focus();
		}
		else {
			if( !$('#username').val() )
				err['username'] = "Inserire l'indirizzo e-mail";
			else if( !regex_email.test( $('#username').val() ) ) {
				err['username'] = "Indirizzo e-mail non valido";
			}
			if( !$('#password').val() )
				err['password'] = "Inserire la password";
			else if( $('#password').val() != $('#conferma_password').val() )
				err['conferma_password'] = "Le password non corrispondono";
			else if( $('#password').val().length < 8 ) {
				err['password'] = "Password troppo corta: minimo 8 caratteri";
			}
			for( i in err ) {
				$('#' + i + '_error').html(err[i]).addClass('error').slideDown( );
			}
			$('.alert:not(.error)').slideUp( );
			if( $('.alert.error' ).length == 0 ) {
				$.mobile.loading( 'show' );
				$('.alert').slideUp( );
				$.ajax({
					url: ajax_url,
					dataType: 'jsonp',
					xhrFields: {
						withCredentials: true
					},
					data: {
						action: 'register',
						username: $('#username').val(),
						pwd: $('#password').val(),
					}
				}).fail( function ( response, status, error ) {
					if( response.status == 404 ) {
						$('#username_error').html('E-mail già utilizzata').slideDown( );
					}
					else {
						$('#username_error').html('Errore di autenticazione').slideDown( );
					}
					$.mobile.loading( 'hide' );
				}).done( function ( response, status ) {
					location.href = "profile.html";
				});
			}
		}
	});
});

$( document ).on( 'pageshow', '#search', function(event) {
	$( '#search-error' ).hide();
	$.ajax({
		url: ajax_url,
		dataType: 'jsonp',
		xhrFields: {
			withCredentials: true
		},
		data: {
			action: 'check-login'
		}
	}).fail( function ( response, status, error ) {
		$('#load_profile').closest('DIV').hide( );
		$('#load_register').closest('DIV').fadeIn('fast');
	}).done( function ( response, status ) {
		$('#load_profile').closest('DIV').fadeIn('fast');
		$('#load_register').closest('DIV').hide( );
	});		
	$('#load_register').click( function(e) {
		location.href = "login.html";
	});
	$('#load_profile').click( function(e) {
		location.href = "profile.html";
	});
	$( '#search-list' ).on( 'listviewbeforefilter', function ( e, data ) {
		var $ul = $( this ),
			$input = $( data.input ),
			value = $input.val(),
			html = "";
		var last = new Date();
		$.ajax({
			url: ajax_url,
			dataType: 'jsonp',
			xhrFields: {
				withCredentials: true
			},
			data: {
				action: 'search',
				q: $input.val()
			}
		}).fail( function ( response, status, error ) {
			$ul.html( '' );
			$('#search-info').hide( );
			$('#search-error').fadeIn( );
		}).done( function ( response, status ) {
			var html = '';
			$.each( response, function ( i, val ) {
				html += '<li><a href="people.html?name=' + val.post_name + '">' + 
					( val.thumbnail || '' ) + 
					'<h2>' + val.post_title + '</h2>'
					'</a></li>';
			});
			if( html ) {
				$ul.html( html );
				$ul.listview( 'refresh' );
				$ul.trigger( 'updatelayout' );
				$('#search-info').hide( );
				$ul.fadeIn( 'fast' );
			}
			else {
				$ul.html( '' );
				$ul.listview( 'refresh' );
				$ul.trigger( 'updatelayout' );
				$('#search-info').fadeIn( );
			}
			$('#search-error').hide();
		});
	});
});

$( document ).on( 'pageshow', '#profile', function(event) {
	$.mobile.loading( 'show' );
	$.ajax({
		url: ajax_url,
		crossDomain: true,
		dataType: 'jsonp',
		xhrFields: {
			withCredentials: true
		},
		data: {
			action: 'profile'
		}
	}).fail( function ( response, status, error ) {
		location.href = "login.html";
	}).done( function ( response, status ) {
		for( i in response.meta ) {
			if( response.meta[i][0] )
				if( $("#" + i ).is(":input") )
					$("#" + i ).val( response.meta[i][0] );
				if( $("#" + i ).is("SELECT") )
					$("#" + i ).selectmenu('refresh');
				else if( $("#" + i ).is("TEXTAREA") )
					$("#" + i ).textinput('refresh');
		}
		$("#post_content").val( response.post_content ).textinput('refresh');
		$("#post_excerpt").val( response.post_excerpt ).textinput('refresh');
		$.mobile.loading( 'hide' );
	});

	$("#get-facebook-profile").click( function(e) {
		$.mobile.loading( 'show' );
		FB.login(function(response) {
			if (response.authResponse) {
				FB.api(
					'/me',
					function (response) {
						if (response && !response.error) {
							console.log(response);
						}
						$.mobile.loading( 'hide' );
					}
				);
			}
		});
/*		$args = {
			action: 'get-facebook-profile',
		}
		$.ajax({
			url: ajax_url,
			crossDomain: true,
			dataType: 'jsonp',
			xhrFields: {
				withCredentials: true
			},
			data: $args
		}).fail( function ( response, status, error ) {
			$.mobile.loading( 'hide' );
		}).done( function ( response, status ) {
			$.mobile.loading( 'hide' );
			alert( response );
		});*/
	});

	$("#profile_save").click( function(e) {
		e.preventDefault( );
		$.mobile.loading( 'show' );
		$args = {
			action: 'save-profile',
		}
		$("#profile :input").each( function() {
			$args[$(this).attr("id")] = $(this).val( ); 
		});
		$.ajax({
			url: ajax_url,
			crossDomain: true,
			dataType: 'jsonp',
			xhrFields: {
				withCredentials: true
			},
			data: $args
		}).fail( function ( response, status, error ) {
			$.mobile.loading( 'hide' );
		}).done( function ( response, status ) {
			$.mobile.loading( 'hide' );
			location.href = 'index.html';
		});
	});
	$("#profile_logout").click( function(e) {
		$.mobile.loading( 'show' );
		$.ajax({
			url: ajax_url,
			crossDomain: true,
			dataType: 'jsonp',
			xhrFields: {
				withCredentials: true
			},
			data: {
				action: 'logout'
			}
		}).fail( function ( response, status, error ) {
			alert("LOGOUT FAIL");
		}).done( function ( response, status ) {
			location.href = "index.html";
		});
	});
	$("#profile_thumbnail").click( function(e) {
		location.href = "profile-picture.html";
	});
});

$( document ).on( 'pageshow', '#profile-picture', function(event) {
	$.mobile.loading( 'show' );
	$.ajax({
		url: ajax_url,
		crossDomain: true,
		dataType: 'jsonp',
		xhrFields: {
			withCredentials: true
		},
		data: {
			action: 'profile'
		}
	}).fail( function ( response, status, error ) {
		location.href = "login.html";
	}).done( function ( response, status ) {
		if( response.thumbnail )
			$('#picture_data').attr("src", response.thumbnail[0] );
		$.mobile.loading( 'hide' );
	});
	$("#picture_save").click( function(e) {
		uploadFromGallery( );
	});
});

$( document ).on( 'pageshow', '#people', function(event) {
	$.mobile.loading( 'show' );
	$('A[target="_system"]').click( function(e) {
		e.preventDefault( );
		window.open( $(this).attr("href"), "_system" );
	});
	$.ajax({
		url: ajax_url,
		crossDomain: true,
		dataType: 'jsonp',
		xhrFields: {
			withCredentials: true
		},
		data: {
			action: 'people',
			post_name: $.url.setUrl( $.mobile.document.context.URL ).param( 'name' )
		}
	}).fail( function ( response, status, error ) {
		$('#people-error').fadeIn( );
		$.mobile.loading( 'hide' );
	}).done( function ( response, status ) {
		if( response.thumbnail ) {
			$('#thumbnail').html( response.thumbnail );
		}
		$('#post_title').html( response.post_title );
		if( response.post_content )
			$('#post_content').html( response.post_content );
		else $('#load_content').hide( );
		if( response.post_excerpt )
			$('#post_excerpt').html( response.post_excerpt );
		else $('#load_excerpt').hide( );
		for( i in response.meta ) {
			if( i.indexOf("people_") == 0 ) {
				if( response.meta[i][0] ) {
					if( $("#" + i ).is("A") )
						$("#" + i ).attr("href", response.meta[i][0] ).text( response.meta[i][0].replace( /https?:\/\//, '' ) );
					else if( $("#" + i ).is("SPAN") )
						$("#" + i ).html( response.meta[i][0] );
					else {
						$('#' + i + " A").addClass("has-profile").removeClass("no-profile").removeClass("unknown");
						$( $('#' + i + " A").attr("href") + " .has-profile" ).show();
						$( $('#' + i + " A").attr("href") + " .no-profile" ).hide();
						$( $('#' + i + " A").attr("href") + " A" ).attr("href", response.meta[i][0] );
					}
				}
				else {
					$('#' + i + " A").addClass("no-profile").removeClass("has-profile").removeClass("unknown");
					$( $('#' + i + " A").attr("href") + " .has-profile" ).hide();
					$( $('#' + i + " A").attr("href") + " .no-profile" ).show();
					$( $('#' + i + " A").attr("href") + " A" ).attr("href", "" );
				}
			}
		}
		$('#people-error').hide( );
		$.mobile.loading( 'hide' );
	});
	$('A[target="_system"]').click( function(e) {
		e.preventDefault( );
		window.open( $(this).attr("href"), $(this).attr("target") ); 
	});
});

function uploadFromGallery() {
	navigator.camera.getPicture(uploadPhoto, function(message) { console.log("Error"); }, {
		quality: 50,
		destinationType : Camera.DestinationType.DATA_URL,
		sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		encodingType : Camera.EncodingType.JPEG,
		MediaType : Camera.MediaType.PICTURE
	});
}

function uploadPhoto(imageData) {
	$.mobile.loading( 'show' );
	$('#picture_data').attr("src", "data:image/jpeg;base64,"+imageData);
	$.ajax({
		type : "POST",
		url : ajax_url + "?action=upload",
		dataType: 'jsonp',
		xhrFields: {
			withCredentials: true
		},
		data: {
			"imageData" : encodeURIComponent(imageData)
		},
		dataType : "json",
		contentType : "application/x-www-form-urlencoded; charset=UTF-8"
	}).always( function() {
		$.mobile.loading( 'hide' );
	});
}
