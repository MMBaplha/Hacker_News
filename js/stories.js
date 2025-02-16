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
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
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