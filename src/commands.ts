const commands = {
  ossu_degree: {
    description: 'Whether OSSU offers a degree.',
    response:
      'Does OSSU offer a degree?\nNo. OSSU creates guides to resources that will empower you to learn the curriculum of an undergraduate degree. Individuals who used to be involved in OSSU may be working with other organizations to offer degrees, but Open Source Society University is not involved in those efforts.',
    type: 1,
  },
  math_prereqs: {
    description: 'How to review the math prerequisites.',
    response:
      'How can I review the math prerequisites?\n\nSee our Pre-College Math curriculum for a list of resources to use for reviewing the math prerequisites.',
    type: 1,
  },
  learn_language: {
    description: 'Finding a course for a specific language.',
    response:
      'What is a good course to learn a particular language?\nOSSU focuses on finding the best courses to learn computer science topics, and isn’t focused on finding language-specific courses. If you are looking to learn a particular language or framework there are two great resources to check.\n1. Hackr.io allows users to submit and upvote learning resources for topics such as Python or the Java Spring Framework.\n2. Most languages have a community on Reddit. When you find the community’s page, check to see if there is a wiki or sidebar with resources. For example, see /r/python. Note that the sidebar content can be different depending on whether you use www.reddit.com or old.reddit.com.',
    type: 1,
  },
  firebase_app: {
    description: 'Why the Firebase OSSU app is broken or outdated.',
    response:
      'Why is the Firebase OSSU app different or broken?\n\nThe OSSU curriculum and ecosystem have been collaboratively built by many individuals. The Firebase app was one such contribution. When it was written, it was with the intention of helping future OSSU students.\n\nUnfortunately, the app has not been updated in many years. It does not reflect updates to the curriculum, it contains links to courses that no longer exist, and it has known bugs that prevent students from logging in.\n\nIt is our hope that the creators of the Firebase app can bring the app up to date. Until that time, the firebase app should be considered a deprecated product that is no longer supported.',
    type: 1,
  },
  course_order: {
    description: 'How to sequence the courses.',
    response:
      'In what order should I take the courses?\n\nYou have a few different options:\n- You can progress linearly from top to bottom of the page.\n- You can progress linearly through each individual section, but studying different sections in parallel.\n- You can design your own custom progression using the pre-requisites to guide you.\n\nWe have designed the curriculum to work for any of the above three styles.',
    type: 1,
  },
  free_resources: {
    description: 'Whether every resource must be free.',
    response:
      'Does every resource in the main curriculum have to be free?\n\nYes, that is a core goal of OSSU.\n\nAt the same time, we recognize that education is a resource that requires payment to instructors to make it sustainable in the long term.\nTherefore, we respect the business model of websites like edX, which make their materials free but with some paid add-ons, like official certificates or extra interaction with course instructors.\n\nSo we only require that the learning materials of a resource be free to access, not that every possible add-on be free.\nIt would be ideal if graded assignments were always free. In the event that free assessments are not available OSSU looks for alternate assessments to pair with a course.',
    type: 1,
  },
  coursera_free: {
    description: 'Whether Coursera courses are free to access.',
    response:
      'Are Coursera courses free to access?\n\nShort answer: No. Not anymore.\n\nIn July of 2025, Coursera removed audit access for the vast majority of their courses, including all of the Coursera courses that OSSU included in its curriculum at the time.\n\nUnless something changes at Coursera, OSSU will no longer be recommending their courses.  We are currently reviewing options for free resources that can replace the Coursera courses that are still in the curriculum.\n\nWe ask that you help overcome this challenge by finding replacements and engaging with RFC discussions in the Issues tab where we are discussing alternatives.\n\nWe may have more up-to-date recommendations in the Discord channel so please do check there as well.',
    type: 1,
  },
  edx_upgrade: {
    description: 'Whether the edX Verified Upgrade is necessary.',
    response:
      'Is it necessary to purchase the Verified Upgrade for edX courses?\n\nIf you just want to watch the videos, it is never necessary for any edX course on our curriculum. Note that a number of edX courses only allow students to audit a course for the estimated number of weeks it takes to complete. Students should not begin a course until they are prepared to focus and complete the course.',
    type: 1,
  },
  alt_links: {
    description: 'What alternate course links are for.',
    response:
      "What are the alt links?\n\nSometimes a course is on multiple platforms that are reasonably similar in quality so we have an alt or two linked in case the main one isn't being offered at the time or you prefer the other one.Both are just as good, go with whichever you prefer or whichever is available when you want to take the course.",
    type: 1,
  },
  topic_coverage: {
    description: 'Why a topic is covered or ignored.',
    response:
      "Why doesn't the curriculum cover/ ignore topic X ?\n\nYou can read more about our curricular guidelines and the qualifications of the guidelines' authors here. If you find a topic that is required by our guidelines and is not included in the curriculum, we should make a change! Read more about contributing to a change.",
    type: 1,
  },
  prerequisites: {
    description: 'Why some prerequisites are missing.',
    response:
      "Why is the curriculum missing some pre-requisites?\n\nThe curriculum assumes two things:\n- You are reasonably fluent in English.\n- You have gotten through a standard high school curriculum that included physics and pre-calculus.\n\nWithout these assumptions, the curriculum would be out of control with trying to fill in your knowledge gaps.\nFor those who want to study math pre-requisites, read more here\n\nOf course, if you find that the curriculum is missing a pre-requisite for a course that isn't part of a normal high school curriculum, please let us know!",
    type: 1,
  },
  se_project: {
    description: 'Why a sizable project is required for SE courses.',
    response:
      "Why require experience with a sizable project before the Software Engineering courses?\nSoftware engineering tries to solve the problem of dealing with large programs. Building a sizable program before taking the SE courses will help you understand what SE is trying to solve. We recommend the Jack-to-VM-code compiler project from the nand2tetris course because it's the first project in the curriculum that is complex enough to see value in an SE course.That said, any sizable project will do and can come from outside of the OSSU curriculum.The idea is that you've done some large enough project where the pieces started to feel unmanageable. This experience will expose pain points and lead to a better understanding of SE.",
    type: 1,
  },
  find_course: {
    description: 'How to find a course on a subject.',
    response:
      'How can I find a course on a particular subject?\nAfter completing Core CS, learners are ready to pursue computer science\ntopics of their own interest. How can one find a course on a given topic?\nFor MOOCs an excellent resource is Class Central.\nFor materials from university courses that are online (but not organized)\ninto a MOOC, awesome-courses and\ncs-video-courses\nare good resources. For textbooks, Goodreads\nis a great platform for reader ratings and reviews.\nFor learning a particular programming language or framework,\nsee this question.',
    type: 1,
  },
}

export default commands
