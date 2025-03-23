"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const isFavorite = currentUser && currentUser.isFavorite(story);
  const starType = isFavorite ? "fas" : "far"; // Solid star if favorite, outline if not

  return $(`
    <li id="${story.storyId}">
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}

async function submitNewStory(evt) {
  evt.preventDefault(); // Prevent page refresh

  // Get form data
  const title = $("#title").val();
  const author = $("#author").val();
  const url = $("#url").val();

  // Ensure user is logged in
  if (!currentUser) {
    alert("You must be logged in to submit a story.");
    return;
  }

  // Call addStory and get the new story object
  const newStory = await storyList.addStory(currentUser, { title, author, url });

  // Append the new story to the page
  const $storyElement = generateStoryMarkup(newStory);
  $("#all-stories-list").prepend($storyElement);

  // Reset and hide the form
  $("#submit-form").trigger("reset").addClass("hidden");
}

// Event listener for form submission
$("#submit-form").on("submit", submitNewStory);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function editStory(evt) {
  const $target = $(evt.target);
  const storyId = $target.closest("li").attr("id");

  // Prompt user for new details
  const newTitle = prompt("Enter new title:");
  const newAuthor = prompt("Enter new author:");

  if (!newTitle || !newAuthor) return;

  await storyList.updateStory(storyId, { title: newTitle, author: newAuthor });

  // Update UI
  $(`#${storyId} .story-link`).text(newTitle);
  $(`#${storyId} .story-author`).text(`by ${newAuthor}`);
}

$("#all-stories-list").on("click", ".edit-story", editStory);

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $favoriteStoriesList.append("<h5>No favorite stories added yet!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    }
  }

  $favoriteStoriesList.show();
}

async function deleteStory(evt) {
  const $target = $(evt.target);
  const storyId = $target.closest("li").attr("id");

  // Call API to delete the story
  await storyList.deleteStory(storyId);

  // Remove story from the DOM
  $target.closest("li").remove();
}

// Attach event listener to dynamically created delete icons
$("#all-stories-list").on("click", ".delete-story", deleteStory);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $userStoriesList.empty();

  if (currentUser.ownStories.length === 0) {
    $userStoriesList.append("<h5>You haven't added any stories yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story);
      $userStoriesList.append($story);
    }
  }

  $userStoriesList.show();
}

async function toggleFavorite(evt) {
  const $star = $(evt.target);
  const storyId = $star.closest("li").attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($star.text() === "★") {
    await currentUser.removeFavorite(story);
    $star.text("☆");
  } else {
    await currentUser.addFavorite(story);
    $star.text("★");
  }
}

// Attach event listener to dynamically created favorite icons
$("#all-stories-list").on("click", ".favorite-star", toggleFavorite);

async function toggleStoryFavorite(evt) {
  const $target = $(evt.target);
  const storyId = $target.closest("li").attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($target.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $target.removeClass("fas").addClass("far");
  } else {
    await currentUser.addFavorite(story);
    $target.removeClass("far").addClass("fas");
  }
}

// Attach event listener to the favorite star icons
$("#all-stories-list").on("click", ".star i", toggleStoryFavorite);