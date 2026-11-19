"use client";

import { useState } from "react";
import { Project, Role } from "../../lib/types";
import { ExpensesPage } from "./ExpensesPage";
import { SalariesPage } from "./SalariesPage";
import { EquipmentRentalPage } from "./EquipmentRentalPage";

export function FinancePage({
  projects,
  onNotify,
  initialView = "expenses",
  role,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
  initialView?: "expenses" | "salaries" | "equipment";
  role?: Role;
}) {
  const [view, setView] = useState<"expenses" | "salaries" | "equipment">(initialView);
  const showExpenses = role === "ceo" || role === "hoo";
  const showSalaries = role === "ceo" || role === "hoo" || role === "finance";
  const showEquipment = role === "ceo" || role === "hoo" || role === "finance";

  return (
    <section className="page-section finance-workspace">
      <div className="finance-section-tabs" role="tablist" aria-label="Finance views">
        {showExpenses && (
          <button
            className={view === "expenses" ? "selected" : ""}
            onClick={() => setView("expenses")}
            role="tab"
            aria-selected={view === "expenses"}
          >
            Expenses
          </button>
        )}
        {showSalaries && (
          <button
            className={view === "salaries" ? "selected" : ""}
            onClick={() => setView("salaries")}
            role="tab"
            aria-selected={view === "salaries"}
          >
            Salaries
          </button>
        )}
        {showEquipment && (
          <button
            className={view === "equipment" ? "selected" : ""}
            onClick={() => setView("equipment")}
            role="tab"
            aria-selected={view === "equipment"}
          >
            Equipment Rental
          </button>
        )}
      </div>
      {view === "expenses" && showExpenses ? (
        <ExpensesPage projects={projects} role={role ?? "ceo"} onNotify={onNotify} />
      ) : view === "salaries" && showSalaries ? (
        <SalariesPage projects={projects} onNotify={onNotify} />
      ) : view === "equipment" && showEquipment ? (
        <EquipmentRentalPage projects={projects} onNotify={onNotify} />
      ) : null}
    </section>
  );
}
