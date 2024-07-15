// blog-list.js

// Function to fetch and parse blog posts
async function fetchBlogPosts() {
  const blogDir = "../blogs/";
  const blogPosts = [];

  // Fetch the list of files in the blogs directory
  const response = await fetch(blogDir);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const links = doc.querySelectorAll("a");

  for (const link of links) {
    if (link.href.endsWith(".html")) {
      const fileName = link.href.split("/").pop();
      const blogContent = await fetch(blogDir + fileName).then((res) =>
        res.text(),
      );
      const blogDoc = parser.parseFromString(blogContent, "text/html");

      const title = blogDoc.querySelector("h1")?.textContent || "Untitled";
      const dateStr =
        blogDoc.querySelector("h2")?.textContent || "Unknown Date";
      const timestamp = new Date(dateStr).getTime();

      blogPosts.push({
        title,
        date: dateStr,
        timestamp,
        file: fileName,
      });
    }
  }

  return blogPosts;
}

// Function to sort blog posts
function sortPosts(posts, order) {
  return posts.sort((a, b) => {
    return order === "asc"
      ? a.timestamp - b.timestamp
      : b.timestamp - a.timestamp;
  });
}

// Function to display blog posts
function displayPosts(posts) {
  const listElement = document.getElementById("blog-list");
  listElement.innerHTML = "";
  posts.forEach((post) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `blogs/${post.file}`;
    a.textContent = `${post.title} - ${post.date}`;
    li.appendChild(a);
    listElement.appendChild(li);
  });
}

// Main function to initialize the blog list
async function initBlogList() {
  const blogPosts = await fetchBlogPosts();
  let currentOrder = "desc";

  displayPosts(sortPosts(blogPosts, currentOrder));

  document.getElementById("sort-newest").addEventListener("click", () => {
    currentOrder = "desc";
    displayPosts(sortPosts(blogPosts, currentOrder));
  });

  document.getElementById("sort-oldest").addEventListener("click", () => {
    currentOrder = "asc";
    displayPosts(sortPosts(blogPosts, currentOrder));
  });
}

// Run the initialization when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initBlogList);
