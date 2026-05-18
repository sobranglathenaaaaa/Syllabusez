"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";

function reorder(list, from, to) {
  if (from === to || to < 0 || to >= list.length) {
    return list;
  }
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy.map((week, index) => ({ ...week, order_index: index + 1 }));
}

export function SyllabusBuilder({ initialDraft, onSave }) {
  const [serverState, setServerState] = useState(initialDraft);
  const [title, setTitle] = useState(initialDraft.title ?? "");
  const [isPending, startTransition] = useTransition();
  const [fileStatus, setFileStatus] = useState("");

  const [optimisticState, applyOptimistic] = useOptimistic(serverState, (state, action) => {
    if (action.type === "addOutcome") {
      return {
        ...state,
        learning_outcomes: [...state.learning_outcomes, { description: action.description, order_index: state.learning_outcomes.length + 1 }],
      };
    }

    if (action.type === "addWeek") {
      return {
        ...state,
        weekly_plans: [
          ...state.weekly_plans,
          {
            week: state.weekly_plans.length + 1,
            topic: action.topic,
            activities: "",
            assessments: "",
            materials: "",
            order_index: state.weekly_plans.length + 1,
          },
        ],
      };
    }

    if (action.type === "moveWeek") {
      return { ...state, weekly_plans: reorder(state.weekly_plans, action.from, action.to) };
    }

    return state;
  });

  const totalWeeks = useMemo(() => optimisticState.weekly_plans.length, [optimisticState.weekly_plans.length]);

  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("syllabusId", optimisticState.id);
    formData.append("file", file);

    setFileStatus("Uploading...");
    try {
      const response = await fetch("/api/materials/upload", { method: "POST", body: formData });
      const data = await response.json();
      setFileStatus(response.ok ? `Uploaded. Signed URL ready: ${data.signedUrl}` : data.error || "Upload failed.");
    } catch {
      setFileStatus("Upload failed due to a network error.");
    }
  }

  function handleSave() {
    startTransition(async () => {
      const payload = { ...optimisticState, title };
      const result = await onSave(payload);
      if (!result.error) {
        setServerState(result.data);
      }
    });
  }

  return (
    <section className="space-y-5 rounded border border-zinc-200 bg-white p-4">
      <header>
        <h2 className="text-lg font-semibold">Syllabus Builder</h2>
        <p className="text-sm text-zinc-600">Create outcomes and weekly plans with optimistic updates.</p>
      </header>

      <label htmlFor="syllabus-title" className="block text-sm font-medium">
        Syllabus title
      </label>
      <input
        id="syllabus-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border p-2"
        placeholder="Course syllabus title"
      />

      <div>
        <h3 className="mb-2 font-medium">Learning Outcomes</h3>
        <ul className="space-y-2">
          {optimisticState.learning_outcomes.map((item) => (
            <li key={`${item.order_index}-${item.description}`} className="rounded border border-zinc-200 p-2 text-sm">
              {item.order_index}. {item.description}
            </li>
          ))}
        </ul>
        <button
          className="mt-2 rounded border border-zinc-300 px-3 py-1 text-sm"
          type="button"
          onClick={() => applyOptimistic({ type: "addOutcome", description: `Outcome ${optimisticState.learning_outcomes.length + 1}` })}
        >
          Add Outcome
        </button>
      </div>

      <div>
        <h3 className="mb-2 font-medium">Weekly Plans ({totalWeeks})</h3>
        <ul className="space-y-2">
          {optimisticState.weekly_plans.map((week, index) => (
            <li key={`${week.order_index}-${week.topic}`} className="rounded border border-zinc-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Week {week.week}: {week.topic}</span>
                <div className="flex gap-2">
                  <button
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                    type="button"
                    onClick={() => applyOptimistic({ type: "moveWeek", from: index, to: index - 1 })}
                  >
                    ↑
                  </button>
                  <button
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                    type="button"
                    onClick={() => applyOptimistic({ type: "moveWeek", from: index, to: index + 1 })}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button
          className="mt-2 rounded border border-zinc-300 px-3 py-1 text-sm"
          type="button"
          onClick={() => applyOptimistic({ type: "addWeek", topic: `Topic ${optimisticState.weekly_plans.length + 1}` })}
        >
          Add Week
        </button>
      </div>

      <div>
        <label htmlFor="material-upload" className="mb-1 block text-sm font-medium">
          Upload Material
        </label>
        <input id="material-upload" type="file" onChange={uploadFile} className="block text-sm" />
        {fileStatus ? (
          <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-xs text-zinc-600 break-all">
            {fileStatus}
          </p>
        ) : null}
      </div>

      <button disabled={isPending} className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60" type="button" onClick={handleSave}>
        {isPending ? "Saving..." : "Save Draft"}
      </button>
    </section>
  );
}
