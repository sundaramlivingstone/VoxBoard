import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenRuler,
  faFile,
  faTrashCan,
  faBell,
  faPlus,
  faSliders,
  faFileLines,
  faPencilAlt,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("recently");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Load projects from localStorage on mount
  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    setProjects(storedProjects);
  }, []);

  // Create a new project and immediately set it to editing mode
  const createNewProject = (type = "whiteboard") => {
    const newProject = {
      id: Date.now().toString(),
      name: `Untitled-${projects.length + 1}`,
      type: type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    // Set to editing mode immediately after creation
    setEditingId(newProject.id);
    setEditingName(newProject.name);

    return newProject;
  };

  // Delete a project
  const deleteProject = (projectId, e) => {
    e.stopPropagation();
    e.preventDefault();
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
  };

  // Start editing a project name
  const startEditing = (projectId, projectName, e) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(projectId);
    setEditingName(projectName);
  };

  // Save the edited project name
  const saveProjectName = (projectId, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (editingName.trim() === "") return;

    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        return {
          ...project,
          name: editingName,
          updatedAt: new Date().toISOString(),
        };
      }
      return project;
    });

    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setEditingId(null);
    setEditingName("");
  };

  // Cancel editing
  const cancelEditing = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(null);
    setEditingName("");
  };

  // Format date to show days ago
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-orange-500 text-white rounded-md w-8 h-8 flex items-center justify-center mr-2">
            S
          </div>
          <div className="font-medium">SUNDARAM KUMAR</div>
          <div className="ml-1 text-gray-500">▼</div>
        </div>
        <div className="flex items-center">
          <button className="p-2 text-gray-500">
            <FontAwesomeIcon icon={faBell} />
          </button>
          <div className="ml-4 relative">
            <input
              type="text"
              placeholder="Search for anything"
              className="pl-8 pr-3 py-2 rounded-md border border-gray-300 bg-gray-100 w-60"
            />
            <div className="absolute left-2 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <div className="flex flex-1">
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Navigation Menu */}
          <nav className="overflow-y-auto p-4">
            <div className="mb-4">
              <div className="text-gray-500 text-xs uppercase tracking-wider">
                Recent
              </div>
              <ul className="mt-2">
                <li className="mb-1">
                  <Link
                    to="/recents"
                    className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-md text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span className="text-sm">Recents</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-500 text-xs uppercase tracking-wider">
                  Personal
                </div>
                <button className="text-sm text-blue-500">
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              <ul>
                <li className="mb-1">
                  <Link
                    to="/drafts"
                    className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-md text-gray-700"
                  >
                    <FontAwesomeIcon
                      icon={faFileLines}
                      className="w-4 h-4 mr-3 text-gray-500"
                    />
                    <span className="text-sm">Drafts</span>
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    to="/projects"
                    className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-md text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <span className="text-sm">All projects</span>
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    to="/trash"
                    className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-md text-gray-700"
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className="w-4 h-4 mr-3 text-gray-500"
                    />
                    <span className="text-sm">Trash</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                Starred
              </div>
              <ul>
                <li className="mb-1">
                  <Link
                    to="/team-project"
                    className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-md text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 mr-3 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span className="text-sm">Team project</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Bottom section */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800 mb-2">
                You're running out of files in your free team.
              </p>
              <button className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-600 w-full">
                View plans
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-xl font-medium mb-6">Recents</h1>

            {/* Creation Options */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div
                onClick={() => createNewProject("design")}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faPenRuler} className="text-white" />
                </div>
                <span className="text-sm font-medium">New design file</span>
              </div>

              <div
                onClick={() => createNewProject("figJam")}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faSliders} className="text-white" />
                </div>
                <span className="text-sm font-medium">New FigJam board</span>
              </div>

              <div
                onClick={() => createNewProject("slide")}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faFile} className="text-white" />
                </div>
                <span className="text-sm font-medium">New slide deck</span>
                <span className="text-xs text-gray-500 mt-1">Beta</span>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={faPlus} className="text-gray-500" />
                </div>
                <span className="text-sm font-medium">Import</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex space-x-8">
                <button
                  className={`pb-2 ${
                    activeTab === "recently"
                      ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("recently")}
                >
                  Recently viewed
                </button>
                <button
                  className={`pb-2 ${
                    activeTab === "shared-files"
                      ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("shared-files")}
                >
                  Shared files
                </button>
                <button
                  className={`pb-2 ${
                    activeTab === "shared-projects"
                      ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("shared-projects")}
                >
                  Shared projects
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            {projects.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    {/* Project Thumbnail */}
                    <Link to={`/whiteboard/${project.id}`}>
                      <div className="h-40 bg-gray-100 flex items-center justify-center">
                        {project.type === "whiteboard" && (
                          <FontAwesomeIcon
                            icon={faPenRuler}
                            className="text-gray-400 text-4xl"
                          />
                        )}
                        {project.type === "design" && (
                          <FontAwesomeIcon
                            icon={faPenRuler}
                            className="text-blue-400 text-4xl"
                          />
                        )}
                        {project.type === "figJam" && (
                          <FontAwesomeIcon
                            icon={faSliders}
                            className="text-purple-400 text-4xl"
                          />
                        )}
                        {project.type === "slide" && (
                          <FontAwesomeIcon
                            icon={faFile}
                            className="text-orange-400 text-4xl"
                          />
                        )}
                      </div>
                    </Link>

                    {/* Project Info */}
                    <div className="p-3">
                      {editingId === project.id ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                saveProjectName(project.id, e);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => saveProjectName(project.id, e)}
                            className="ml-1 p-1 text-green-600 hover:text-green-800"
                          >
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-sm"
                            />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="text-sm"
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium truncate">
                              {project.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Edited {formatDate(project.updatedAt)}
                            </div>
                          </div>
                          <button
                            onClick={(e) =>
                              startEditing(project.id, project.name, e)
                            }
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Rename"
                          >
                            <FontAwesomeIcon
                              icon={faPencilAlt}
                              className="text-sm"
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Delete button - visible on hover */}
                    <button
                      onClick={(e) => deleteProject(project.id, e)}
                      className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1.5 text-gray-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No projects yet. Create a new project to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
