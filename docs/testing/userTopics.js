let userTopics = {
  displayName: "Tri Truong",
  email: "truongductri2017@gmail.com",
  topics: [
    {
      courseTitle: "System Design Basics",
      title: "What is System Design?",
      description: "An overview of system design concepts.",
      estimatedTime: "10 minutes",
      question:
        "Explain the difference between high-level and low-level design.",
      resources: ["https://example.com/system-design-intro"],
      status: "NotStarted",
    },
    {
      courseTitle: "System Design Basics",
      title: "What is System Design?",
      description: "An overview of system design concepts.",
      estimatedTime: "10 minutes",
      question:
        "Explain the difference between high-level and low-level design.",
      resources: ["https://example.com/system-design-intro"],
      status: "NotStarted",
    },
  ],
};

function renderUserTopics(userTopics) {
  const container = document.createElement("div");
  container.style.maxWidth = "600px";
  container.style.margin = "2rem auto";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.background = "#f9f9f9";
  container.style.padding = "1rem";

  // Motivational header
  const header = document.createElement("h2");
  header.textContent = `🚀 Ready to Spark Your Learning, ${userTopics.displayName}!`;
  header.style.color = "#f7b84a";
  container.appendChild(header);

  userTopics.topics.forEach((topic) => {
    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.border = "1px solid #e3e3e3";
    card.style.padding = "1rem";
    card.style.marginBottom = "1rem";

    const courseTitle = document.createElement("span");
    courseTitle.textContent = topic.courseTitle;
    courseTitle.style.fontWeight = "bold";
    courseTitle.style.color = "#1a4e8a";
    courseTitle.style.background = "#eaf1fb";
    courseTitle.style.padding = "2px 8px";
    card.appendChild(courseTitle);

    const topicTitle = document.createElement("div");
    topicTitle.textContent = `✨ ${topic.title}`;
    topicTitle.style.fontWeight = "600";
    topicTitle.style.color = "#222";
    topicTitle.style.margin = "4px 0";
    card.appendChild(topicTitle);

    const status = document.createElement("span");
    status.textContent = `Status: ${topic.status}`;
    status.style.background = topic.status === "Completed" ? "#c8e6c9" : "#fff3d6";
    status.style.color = topic.status === "Completed" ? "#388e3c" : "#f7b84a";
    status.style.padding = "2px 10px";
    card.appendChild(status);

    const time = document.createElement("p");
    time.textContent = `Estimated Time: ${topic.estimatedTime}`;
    card.appendChild(time);

    const desc = document.createElement("p");
    desc.textContent = `Description: ${topic.description}`;
    card.appendChild(desc);

    const question = document.createElement("p");
    question.textContent = `Question: ${topic.question}`;
    card.appendChild(question);

    if (topic.resources && topic.resources.length > 0) {
      const resources = document.createElement("p");
      resources.innerHTML = `Resources: ${topic.resources
        .map((r) => `<a href='${r}' target='_blank' style='color:#2d6cdf;'>${r}</a>`)
        .join(", ")}`;
      card.appendChild(resources);
    }

    container.appendChild(card);
  });
  return container;
}

// Example usage:
document.body.appendChild(renderUserTopics(userTopics));
