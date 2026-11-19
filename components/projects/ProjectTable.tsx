import React from "react";
import { Eye } from "lucide-react";
import { Project, ProjectApprovalStatus, ProjectProgressStatus } from "../../lib/types";
import { formatDate, statusColors } from "../../lib/dummy-data/mock-data";

const approvalStatus = (project: Project): ProjectApprovalStatus =>
  project.approvalStatus ??
  (project.status === "Rejected" ? "Rejected" : "Approved");

const progressStatus = (project: Project): ProjectProgressStatus | null =>
  approvalStatus(project) === "Approved"
    ? project.progressStatus ?? (project.status === "Rejected" ? "Upcoming" : project.status)
    : null;

export function ProjectTable({
  projects,
  onSelect,
  showStartDate = true,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
  showStartDate?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Project title</th>
            <th>Client</th>
            <th>Production manager</th>
            <th>Created date</th>
            <th>Approval status</th>
            <th>Progress</th>
            {showStartDate && <th>Production dates</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <strong className="project-id">{p.id}</strong>
              </td>
              <td>
                <button className="project-link" onClick={() => onSelect(p)}>
                  <span
                    className="project-dot"
                    style={{ background: statusColors[p.status] }}
                  />
                  <strong>{p.name}</strong>
                </button>
              </td>
              <td>{p.client}</td>
              <td>{p.owner}</td>
              <td>{formatDate(p.createdAt ?? p.start)}</td>
              <td>
                <span
                  className={
                    "status-pill project-approval-" +
                    approvalStatus(p).toLowerCase().replaceAll(" ", "-")
                  }
                >
                  {approvalStatus(p)}
                </span>
              </td>
              <td>
                {progressStatus(p) ? (
                  <span className={"status-pill " + progressStatus(p)!.toLowerCase().replaceAll(" ", "-")}>
                    {progressStatus(p)}
                  </span>
                ) : (
                  <span className="muted-value">Not started</span>
                )}
              </td>
              {showStartDate && (
                <td>
                  {formatDate(p.start)} - {formatDate(p.end)}
                </td>
              )}
              <td>
                <button className="button button-secondary project-view-button" onClick={() => onSelect(p)}>
                  <Eye size={14} /> View details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
