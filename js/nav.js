"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

// Select the submit story form and navbar link
const $submitForm = $("#submit-form");
const $navSubmit = $("#nav-submit");

// Event listener for clicking "Submit" in the navbar
$navSubmit.on("click", function (evt) {
  if (!currentUser) {
    alert("You must be logged in to submit a story.")
    return;
  }
  $submitForm.toggleClass("hidden"); // Toggle visibility
});

$("#nav-user-profile").on("click", function () {
  
  /* Hide the Submit btn when profile is open */
  $("#nav-submit").parent().hide();

  /* Show profile form and hide pther components*/
  $(".stories-container, .account-forms-container").addClass("hidden");
  $(".profile-form-container").removeClass("hidden");
});

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  $(".nav-right").show();
  $("#nav-login").hide();
  $("#nav-logout").removeClass("hidden");
  $("#nav-user-profile").text(`${currentUser.name}`).show();

  /** Show "Submit" link only when logged in and on the landing page. **/ 
  if (currentUser && (window.location.hash === "" || window.location.hash === "#")) {
    $("#nav-submit").parent().show();
  } else {
    $("#nav-submit").parent().hide();
  }
}

// Ensure "Submit" is hidden on page load
$("#nav-submit").parent().hide(); 

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick");
  hidePageComponents();
  putFavoriteStoriesOnPage();
}

$("#nav-favorites").on("click", navFavoritesClick);