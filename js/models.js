"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "hostname.com";
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { title, author, url }) {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data:{
        token: user.loginToken,
        story: { title, author, url },
      }, 
    });
    const newStory = new Story(response.data.story);
    this.stories.unshift(newStory);
    user.ownStories.unshift(newStory);
    
    return newStory;
  }

  async updateStory(storyId, storyData) {
    await axios({
      method: "PATCH",
      url: `${BASE_URL}/stories/${storyId}`,
      data: { token: currentUser.loginToken, ...storyData },
    });
  
    // Update local data
    const story = this.stories.find(story => story.storyId === storyId);
    Object.assign(story, storyData);
  }  
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    try {
      const response = await axios.post(`${BASE_URL}/signup`, { user: { username, password, name } });
      return new User(response.data.user, response.data.token);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("Username already taken. Please choose another one.");
      } else {
        alert("Error signing up. Please try again.");
      }
    }
  }  

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { user: { username, password } });
      return new User(response.data.user, response.data.token);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Invalid username or password. Please try again.");
      } else {
        alert("Error logging in. Please try again.");
      }
    }
  }  

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavorite(story) {
    this.favorites.push(story);
    await axios.post(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`, {
      token: this.loginToken
    });
  } 

  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`, {
      data: { token: this.loginToken }
    });
  }
  
  isFavorite(story) {
    return this.favorites.some(s => s.storyId === story.storyId);
  }

  async deleteStory(storyId) {
    await axios({
      method: "DELETE",
      url: `${BASE_URL}/stories/${storyId}`,
      data: { token: currentUser.loginToken },
    });
  
    // Remove the story from the local list
    this.stories = this.stories.filter(story => story.storyId !== storyId);
    currentUser.ownStories = currentUser.ownStories.filter(story => story.storyId !== storyId);
  }  
}