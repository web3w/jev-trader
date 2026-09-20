# TypeSafe parallel questions and response types

Checked on 2026-09-19.

Conclusion: TypeSafe supports mixing Noul, Choice and Score questions in a single request, but does not automatically return all three types on every call. Responses depend on the questions the caller submits. The official introduction defines the three question types and explains that submitted questions can be evaluated independently and in parallel against the same state. [Source: Introduction](https://docs.typesafe.ai/introduction)

The HTTP API makes the mapping explicit: `questions` is a caller-named collection, and `answers` returns one answer for each question under the same key. Each answer's `type` matches its question. The official example submits only one `is_urgent` Noul question, and its response contains only that Noul answer. [Source: API reference — Request body, Response body and Answer types](https://docs.typesafe.ai/api)

The current guide labels its three parallel tracks Noul, Choice and Score without explaining that this illustrates a request containing all three question types. This can suggest that every call always produces all three types. Suggested wording: “Submit multiple independent questions, evaluated in parallel against shared state.” Label tracks “Question 1 / Question 2 / … / Question N” and explain that each question specifies one type and receives its corresponding answer. This wording recommendation follows from the API rules above. [Page](https://jev-trader.com/jev-ai-decision-model); [local diagram](../../web/src/app/jev-ai-decision-model/JevGuide.tsx)

The current trading call defines only one Choice question, `direction`, in `QUESTIONS` and passes that collection to the model. The guide's three tracks must not be interpreted as the trading application requesting all three types on each call. [Local calling code](../../src/model.ts)
