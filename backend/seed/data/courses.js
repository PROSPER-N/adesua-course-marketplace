const Course = require("../../src/models/Course");
const Lesson = require("../../src/models/Lesson");

const YOUTUBE_URLS = [
  "https://www.youtube.com/watch?v=a_iQb1lnAEQ",
  "https://www.youtube.com/watch?v=Zi-Q0t4gMC8",
  "https://www.youtube.com/watch?v=UmHMVU6dceA",
  "https://www.youtube.com/watch?v=Jg0DjhGXHbg",
  "https://www.youtube.com/watch?v=XDpwDwcXGoU",
  "https://www.youtube.com/watch?v=DSOfPEyeMNg",
  "https://www.youtube.com/watch?v=uVVBviaFGOo",
  "https://www.youtube.com/watch?v=PqpTvwLqFdQ",
  "https://www.youtube.com/watch?v=-moW9jvvMr4",
  "https://www.youtube.com/watch?v=F8nPv7Alrw4",
];

async function seedCourses({ users, categories }) {
  const instructors = {
    kwame: users.find((user) => user.email === "kwame@example.com"),
    ama: users.find((user) => user.email === "ama@example.com"),
  };

  const categoryMap = new Map(categories.map((category) => [category.name, category]));

  const courseData = [
    {
      title: "Build Your First Web Page",
      shortDescription:
        "A practical introduction to HTML, CSS, and the structure of a modern web page.",
      description:
        "Learn how websites are structured and build your first responsive web page using HTML and CSS.",
      whatYouWillLearn: [
        "Understand basic HTML structure",
        "Style pages with CSS",
        "Create responsive layouts",
        "Use semantic HTML",
      ],
      instructor: instructors.kwame._id,
      category: categoryMap.get("Web development")._id,
      price: 0,
      level: "beginner",
    },
    {
      title: "JavaScript Foundations for Beginners",
      shortDescription:
        "Learn the JavaScript basics you need to start building interactive web experiences.",
      description:
        "This beginner-friendly course introduces variables, functions, arrays, objects, and practical JavaScript logic.",
      whatYouWillLearn: [
        "Use variables and data types",
        "Write functions",
        "Work with arrays and objects",
        "Understand basic DOM interaction",
      ],
      instructor: instructors.ama._id,
      category: categoryMap.get("Programming")._id,
      price: 120,
      level: "beginner",
    },
    {
      title: "Starting a Small Business",
      shortDescription:
        "A practical guide to turning a simple idea into a structured small business.",
      description:
        "Learn how to define your offer, understand your customer, price your work, and organise your first business steps.",
      whatYouWillLearn: [
        "Define a clear business offer",
        "Identify your target customer",
        "Create simple pricing",
        "Plan your first sales activities",
      ],
      instructor: instructors.kwame._id,
      category: categoryMap.get("Business")._id,
      price: 85,
      level: "beginner",
    },
    {
      title: "Design Principles for Everyday Creatives",
      shortDescription:
        "Learn the core visual principles that make layouts clearer, stronger, and easier to understand.",
      description:
        "Explore composition, hierarchy, typography, spacing, and visual balance through practical creative exercises.",
      whatYouWillLearn: [
        "Build visual hierarchy",
        "Use spacing effectively",
        "Choose typography combinations",
        "Create balanced compositions",
      ],
      instructor: instructors.ama._id,
      category: categoryMap.get("Design")._id,
      price: 0,
      level: "beginner",
    },
    {
      title: "Social Media Marketing Basics",
      shortDescription:
        "Understand the foundations of creating useful content and reaching the right audience online.",
      description:
        "Learn how to plan content, understand audiences, measure basic results, and build a consistent marketing routine.",
      whatYouWillLearn: [
        "Define your audience",
        "Plan useful content",
        "Understand basic metrics",
        "Build a simple content routine",
      ],
      instructor: instructors.kwame._id,
      category: categoryMap.get("Marketing")._id,
      price: 150,
      level: "intermediate",
    },
    {
      title: "Photography With Your Phone",
      shortDescription:
        "Learn practical smartphone photography techniques for better everyday photos.",
      description:
        "Improve your phone photography by learning composition, lighting, framing, and simple editing techniques.",
      whatYouWillLearn: [
        "Use natural light",
        "Improve composition",
        "Frame stronger photographs",
        "Edit photos simply",
      ],
      instructor: instructors.ama._id,
      category: categoryMap.get("Photography")._id,
      price: 60,
      level: "beginner",
    },
    {
      title: "Building Better Personal Habits",
      shortDescription:
        "Create practical routines that make everyday goals easier to manage and maintain.",
      description:
        "Learn how to set realistic goals, build small habits, manage distractions, and review your progress.",
      whatYouWillLearn: [
        "Set realistic goals",
        "Build repeatable habits",
        "Reduce common distractions",
        "Review progress effectively",
      ],
      instructor: instructors.kwame._id,
      category: categoryMap.get("Personal growth")._id,
      price: 0,
      level: "beginner",
    },
    {
      title: "Responsive Websites With CSS",
      shortDescription:
        "Take your CSS skills further by creating layouts that work across phones, tablets, and desktops.",
      description:
        "Learn responsive CSS techniques including flexible layouts, media queries, grids, and practical page structure.",
      whatYouWillLearn: [
        "Build responsive layouts",
        "Use CSS Grid",
        "Use media queries",
        "Design for smaller screens",
      ],
      instructor: instructors.ama._id,
      category: categoryMap.get("Web development")._id,
      price: 200,
      level: "intermediate",
    },
    {
      title: "Programming Logic Made Simple",
      shortDescription:
        "Develop the problem-solving habits that make learning any programming language easier.",
      description:
        "Work through practical programming problems while learning conditions, loops, functions, and structured thinking.",
      whatYouWillLearn: [
        "Break problems into steps",
        "Use conditions",
        "Work with loops",
        "Write reusable functions",
      ],
      instructor: instructors.kwame._id,
      category: categoryMap.get("Programming")._id,
      price: 75,
      level: "beginner",
    },
    {
      title: "Branding Basics for Small Businesses",
      shortDescription:
        "Learn how to create a clear and consistent identity for a growing small business.",
      description:
        "Understand brand positioning, visual identity, tone, and the practical elements of presenting a small business consistently.",
      whatYouWillLearn: [
        "Define brand positioning",
        "Create a visual direction",
        "Develop a consistent tone",
        "Apply branding across channels",
      ],
      instructor: instructors.ama._id,
      category: categoryMap.get("Business")._id,
      price: 175,
      level: "intermediate",
    },
    {
      title: "Content Planning for Beginners",
      shortDescription:
        "Build a simple content system that helps you publish consistently without guessing every day.",
      description:
        "Learn how to generate useful content ideas, organise them into a calendar, and create a sustainable publishing routine.",
      whatYouWillLearn: [
        "Find useful content ideas",
        "Organise a content calendar",
        "Create repeatable workflows",
        "Measure basic content results",
      ],
      instructor: instructors.kwame._id,
      category: categoryMap.get("Marketing")._id,
      price: 95,
      level: "beginner",
    },
    {
      title: "Composition and Visual Storytelling",
      shortDescription:
        "Use composition and visual sequencing to make photographs more intentional and engaging.",
      description:
        "Explore visual storytelling through composition, perspective, sequencing, and thoughtful image selection.",
      whatYouWillLearn: [
        "Use stronger composition",
        "Create visual sequences",
        "Experiment with perspective",
        "Select images intentionally",
      ],
      instructor: instructors.ama._id,
      category: categoryMap.get("Photography")._id,
      price: 225,
      level: "advanced",
    },
    {
      title: "A Practical Reset for Busy People",
      shortDescription:
        "A simple framework for organising priorities, routines, and personal projects when life feels scattered.",
      description:
        "Learn a practical approach to reviewing your commitments, choosing priorities, and creating manageable routines.",
      whatYouWillLearn: [
        "Review your priorities",
        "Reduce unnecessary commitments",
        "Create manageable routines",
        "Plan your next steps",
      ],
      instructor: instructors.ama._id,
      category: categoryMap.get("Personal growth")._id,
      price: 0,
      level: "intermediate",
      status: "draft",
    },
  ];
  const courses = [];

  for (const courseInfo of courseData) {
    const course = await Course.create({
      ...courseInfo,
      status: courseInfo.status || "published",
      thumbnailUrl: "",
      lessonCount: 0,
      totalMinutes: 0,
      studentCount: 0,
    });
    const lessonCount = 5 + (courses.length % 4);
    const lessons = [];

    for (let index = 0; index < lessonCount; index += 1) {
      const lesson = await Lesson.create({
        course: course._id,
        title: `${course.title} — Lesson ${index + 1}`,
        videoUrl: YOUTUBE_URLS[index % YOUTUBE_URLS.length],
        content: `Practical notes for lesson ${index + 1}.`,
        durationMinutes: 10 + index * 5,
        order: index + 1,
        isPreview: index === 0,
      });

      lessons.push(lesson);
    }

    course.lessonCount = lessons.length;
    course.totalMinutes = lessons.reduce((total, lesson) => total + lesson.durationMinutes, 0);

    await course.save();

    courses.push(course);
  }

  return courses;
}

module.exports = seedCourses;
