import { Label } from "@/components/ui/label";
import { useProfessorStore } from "@/lib/store/professorStore";

export default function ProfileConfirmStep() {
  const { authorDetails } = useProfessorStore();

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-medium">
          Confirm Profile Details
        </Label>
        <div className="text-sm text-gray-500 mb-4">
          Please confirm this is your academic profile
        </div>

        {authorDetails ? (
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{authorDetails.display_name}</h3>
                <p className="text-gray-600">
                  {authorDetails.works_count} publications · {authorDetails.cited_by_count} citations
                </p>
              </div>
              {authorDetails.summary_stats && (
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">h-index</p>
                      <p className="text-lg font-bold text-blue-700">{authorDetails.summary_stats.h_index}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">i10-index</p>
                      <p className="text-lg font-bold text-blue-700">{authorDetails.summary_stats.i10_index}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {authorDetails.affiliations && authorDetails.affiliations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Current Affiliations</h4>
                <div className="space-y-2">
                  {authorDetails.affiliations.slice(0, 3).map((affiliation, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{affiliation.institution.display_name}</span>
                      {affiliation.years && affiliation.years.length > 0 && (
                        <span className="text-gray-500">
                          {Math.min(...affiliation.years)}-{Math.max(...affiliation.years)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {authorDetails.topPapers && authorDetails.topPapers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Top Papers</h4>
                <div className="space-y-2">
                  {authorDetails.topPapers.map((paper, idx) => (
                    <div key={paper.id} className="border rounded p-2 bg-gray-50">
                      <div className="font-semibold text-blue-900">
                        {idx + 1}. {paper.title}
                      </div>
                      <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                        <span>Citations: {paper.cited_by_count}</span>
                        <span>Year: {paper.publication_year}</span>
                        {paper.doi && (
                          <a
                            href={`https://doi.org/${paper.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-700"
                          >
                            DOI
                          </a>
                        )}
                        {paper.url && (
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-700"
                          >
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {authorDetails.topics && authorDetails.topics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Research Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {authorDetails.topics.slice(0, 10).map((topic, index) => (
                    <div key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {topic.display_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40 border rounded-lg">
            <p className="text-gray-500">Loading author details...</p>
          </div>
        )}
      </div>
    </div>
  );
}