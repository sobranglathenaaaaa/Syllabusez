import { SyllabusEditor } from "@/components/syllabus/SyllabusEditor";

export default async function EditSyllabusPage({ params }) {
  const { id } = await params;
  
  return (
    <div className="py-2">
      <SyllabusEditor syllabusId={id} />
    </div>
  );
}
