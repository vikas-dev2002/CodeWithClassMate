import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "../models/User.js";
import College from "../models/College.js";
import Problem from "../models/Problem.js";
import Contest from "../models/Contest.js";
import Event from "../models/Event.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const PROBLEM_TITLE = "Event-Ease DSA: Longest Subarray With Sum K";
const SECOND_PROBLEM_TITLE = "Event-Ease DSA: Valid Parentheses";
const CONTEST_NAME = "Event-Ease DSA Verification Contest";
const EVENT_TITLE = "Event-Ease DSA Flow Test Event";

const getContestStatus = (startTime, endTime) => {
  const now = new Date();
  if (endTime <= now) return "ended";
  if (startTime <= now && now < endTime) return "ongoing";
  return "upcoming";
};

const ensureCreator = async () => {
  let creator =
    (await User.findOne({ role: "admin" })) ||
    (await User.findOne({ role: "organiser" })) ||
    (await User.findOne({ role: "user" }));

  if (creator) {
    return creator;
  }

  const fallbackCollege =
    (await College.findOne()) ||
    (await College.create({
      name: "Event-Ease Demo College",
      city: "Lucknow",
      state: "UP",
      code: "EEDC",
    }));

  creator = await User.create({
    username: "eventease_demo_admin",
    email: "eventease_demo_admin@example.com",
    password: "Demo@12345",
    role: "admin",
    college: fallbackCollege._id,
    profile: {
      firstName: "Event",
      lastName: "Ease",
      college: fallbackCollege.name,
    },
  });

  return creator;
};

const upsertProblem = async (creatorId) => {
  const problemPayload = {
    title: PROBLEM_TITLE,
    description:
      "Given an integer array nums and an integer k, return the length of the longest subarray whose sum equals k.\n\nUse an O(n) approach with prefix sum + hash map.",
    difficulty: "Medium",
    tags: ["Array", "Hash Map", "Prefix Sum"],
    companies: ["Amazon", "Adobe", "Flipkart"],
    constraints:
      "1 <= nums.length <= 2 * 10^5\n-10^4 <= nums[i] <= 10^4\n-10^9 <= k <= 10^9",
    examples: [
      {
        input: "nums = [1,-1,5,-2,3], k = 3",
        output: "4",
        explanation:
          "Subarray [1, -1, 5, -2] has sum = 3 and length = 4.",
      },
      {
        input: "nums = [-2,-1,2,1], k = 1",
        output: "2",
        explanation: "Subarray [-1, 2] has sum = 1 and length = 2.",
      },
    ],
    testCases: [
      { input: "5\n1 -1 5 -2 3\n3", output: "4", isPublic: true },
      { input: "4\n-2 -1 2 1\n1", output: "2", isPublic: true },
      { input: "6\n3 1 0 1 8 2\n4", output: "3", isPublic: false },
      { input: "5\n1 2 3 4 5\n15", output: "5", isPublic: false },
    ],
    codeTemplates: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

int longestSubarrayWithSumK(vector<int>& nums, long long k) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    long long k;
    cin >> k;
    cout << longestSubarrayWithSumK(nums, k) << "\\n";
    return 0;
}
`,
      python: `def longest_subarray_with_sum_k(nums, k):
    # Write your code here
    return 0

n = int(input().strip())
nums = list(map(int, input().split()))
k = int(input().strip())
print(longest_subarray_with_sum_k(nums, k))
`,
      java: `import java.util.*;

public class Main {
    static int longestSubarrayWithSumK(int[] nums, long k) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        long k = sc.nextLong();
        System.out.println(longestSubarrayWithSumK(nums, k));
        sc.close();
    }
}
`,
      c: `#include <stdio.h>

int longestSubarrayWithSumK(int nums[], int n, long long k) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    int nums[n];
    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);
    long long k;
    scanf("%lld", &k);
    printf("%d\\n", longestSubarrayWithSumK(nums, n, k));
    return 0;
}
`,
    },
    functionSignature: {
      cpp: "int longestSubarrayWithSumK(vector<int>& nums, long long k)",
      python: "def longest_subarray_with_sum_k(nums, k):",
      java: "static int longestSubarrayWithSumK(int[] nums, long k)",
      c: "int longestSubarrayWithSumK(int nums[], int n, long long k)",
    },
    referenceSolution: [
      {
        language: "cpp",
        completeCode: `#include <bits/stdc++.h>
using namespace std;

int longestSubarrayWithSumK(vector<int>& nums, long long k) {
    unordered_map<long long, int> firstIndex;
    firstIndex[0] = -1;
    long long prefix = 0;
    int best = 0;

    for (int i = 0; i < (int)nums.size(); i++) {
        prefix += nums[i];
        if (firstIndex.find(prefix - k) != firstIndex.end()) {
            best = max(best, i - firstIndex[prefix - k]);
        }
        if (firstIndex.find(prefix) == firstIndex.end()) {
            firstIndex[prefix] = i;
        }
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    long long k;
    cin >> k;
    cout << longestSubarrayWithSumK(nums, k) << "\\n";
    return 0;
}
`,
      },
      {
        language: "python",
        completeCode: `def longest_subarray_with_sum_k(nums, k):
    first_index = {0: -1}
    prefix = 0
    best = 0

    for i, value in enumerate(nums):
        prefix += value
        if (prefix - k) in first_index:
            best = max(best, i - first_index[prefix - k])
        if prefix not in first_index:
            first_index[prefix] = i
    return best

n = int(input().strip())
nums = list(map(int, input().split()))
k = int(input().strip())
print(longest_subarray_with_sum_k(nums, k))
`,
      },
    ],
    editorial: {
      written:
        "Use prefix sum + hash map. Store first occurrence index for each prefix sum. For each position `i`, if `prefix - k` appeared before at index `j`, then subarray `(j+1..i)` has sum `k`.",
    },
    createdBy: creatorId,
    visibility: "public",
    isPublished: true,
  };

  const existing = await Problem.findOne({ title: PROBLEM_TITLE });
  if (existing) {
    Object.assign(existing, problemPayload);
    await existing.save();
    return existing;
  }
  return Problem.create(problemPayload);
};

const upsertSecondProblem = async (creatorId) => {
  const payload = {
    title: SECOND_PROBLEM_TITLE,
    description:
      "Given a string s containing only characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    companies: ["Google", "Microsoft", "Amazon"],
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only.",
    examples: [
      { input: 's = "()"', output: "true", explanation: "Simple valid pair." },
      { input: 's = "([)]"', output: "false", explanation: "Order mismatch." },
    ],
    testCases: [
      { input: "()", output: "true", isPublic: true },
      { input: "()[]{}", output: "true", isPublic: true },
      { input: "(]", output: "false", isPublic: false },
      { input: "([)]", output: "false", isPublic: false },
    ],
    codeTemplates: {
      cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    // Write your code here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << "\\n";
    return 0;
}
`,
      python: `def is_valid(s):
    # Write your code here
    return False

s = input().strip()
print("true" if is_valid(s) else "false")
`,
      java: `import java.util.*;

public class Main {
    static boolean isValid(String s) {
        // Write your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        System.out.println(isValid(s) ? "true" : "false");
        sc.close();
    }
}
`,
      c: `#include <stdio.h>
#include <string.h>

int isValid(char s[]) {
    // Write your code here
    return 0;
}

int main() {
    char s[10005];
    scanf("%s", s);
    printf("%s\\n", isValid(s) ? "true" : "false");
    return 0;
}
`,
    },
    functionSignature: {
      cpp: "bool isValid(string s)",
      python: "def is_valid(s):",
      java: "static boolean isValid(String s)",
      c: "int isValid(char s[])",
    },
    referenceSolution: [
      {
        language: "cpp",
        completeCode: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> mp = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char ch : s) {
        if (ch == '(' || ch == '{' || ch == '[') {
            st.push(ch);
        } else {
            if (st.empty() || st.top() != mp[ch]) return false;
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << "\\n";
    return 0;
}
`,
      },
    ],
    editorial: {
      written:
        "Use a stack. Push opening brackets; on closing bracket, stack top must match corresponding opening bracket.",
    },
    createdBy: creatorId,
    visibility: "public",
    isPublished: true,
  };

  const existing = await Problem.findOne({ title: SECOND_PROBLEM_TITLE });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Problem.create(payload);
};

const upsertContest = async (problemIds, creatorId) => {
  const startTime = new Date(Date.now() - 10 * 60 * 1000);
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const duration = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)));
  const status = getContestStatus(startTime, endTime);

  const contestPayload = {
    name: CONTEST_NAME,
    description: "Two-problem DSA contest for end-to-end flow testing.",
    startTime,
    endTime,
    duration,
    status,
    problems: problemIds.map((problemId, index) => ({
      problem: problemId,
      score: 100,
      order: index + 1,
    })),
    createdBy: creatorId,
    isPublic: true,
    leaderboardVisible: true,
    freezeTime: 0,
    allowedLanguages: ["c", "cpp", "java", "python", "js"],
  };

  const existing = await Contest.findOne({ name: CONTEST_NAME });
  if (existing) {
    Object.assign(existing, contestPayload);
    await existing.save();
    return existing;
  }
  return Contest.create(contestPayload);
};

const upsertEvent = async (contestId, creator) => {
  const eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const creatorCollege =
    creator.college ||
    (await College.findOne())?._id ||
    (await College.create({
      name: "Event-Ease Contest College",
      city: "Lucknow",
      state: "UP",
      code: "EECC",
    }))._id;

  const eventPayload = {
    title: EVENT_TITLE,
    description:
      "Practice coding event to verify registration, problem solving, and leaderboard flow.",
    venue: "Online Coding Arena",
    date: eventDate,
    startTime: "10:00",
    endTime: "13:00",
    capacity: 300,
    eventType: "coding_contest",
    tags: ["dsa", "practice", "verification"],
    college: creatorCollege,
    createdBy: creator._id,
    contestId,
    isActive: true,
  };

  const existing = await Event.findOne({ title: EVENT_TITLE });
  if (existing) {
    Object.assign(existing, eventPayload);
    await existing.save();
    return existing;
  }
  return Event.create(eventPayload);
};

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const creator = await ensureCreator();
  const problem = await upsertProblem(creator._id);
  const secondProblem = await upsertSecondProblem(creator._id);
  const contest = await upsertContest([problem._id, secondProblem._id], creator._id);
  const event = await upsertEvent(contest._id, creator);

  console.log("\n✅ Demo DSA setup complete");
  console.log("Problem 1:", problem.title, `(${problem._id})`);
  console.log("Problem 2:", secondProblem.title, `(${secondProblem._id})`);
  console.log("Contest:", contest.name, `(${contest._id})`);
  console.log("Event:", event.title, `(${event._id})`);
};

run()
  .catch((error) => {
    console.error("❌ Failed to seed demo DSA event:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
