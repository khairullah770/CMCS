"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Package,
  UserRound,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { RateCardTemplatesPage } from "./RateCardTemplatesPage";
import {
  equipmentFunctions,
  equipmentSeed,
} from "../../lib/dummy-data/equipment";
import { staffFunctions, staffSeed } from "../../lib/dummy-data/staff";
import { RateCardRate, RateCardTemplate } from "../../lib/types";
import { rateKey, RateMap } from "../../lib/rate-cards";

type RateType = RateCardRate["type"];
type RateUnit = RateCardRate["unit"];
type Currency = RateCardRate["currency"];
type ResourceKind = "Equipment" | "Staff";
type Rate = RateCardRate;

const units: RateUnit[] = ["Per Hour", "Per Day", "Per Project"];
const currencies: Currency[] = ["USD", "AFN"];
const rateTypes: RateType[] = ["Internal", "External"];

function initialRates(): RateMap {
  const rates: RateMap = {};
  equipmentSeed.forEach((item, index) => {
    rates[rateKey("Equipment", item.id)] = {
      cost: 35 + index * 5,
      selling: 60 + index * 8,
      type: item.company === "CMCS" ? "Internal" : "External",
      unit: "Per Day",
      currency: "USD",
    };
  });
  staffSeed.forEach((item, index) => {
    rates[rateKey("Staff", item.id)] = {
      cost: 900 + index * 150,
      selling: 1250 + index * 200,
      type: item.freelance ? "External" : "Internal",
      unit: "Per Project",
      currency: "USD",
    };
  });
  return rates;
}

function RateEditor({
  rate,
  canManage,
  onChange,
}: {
  rate: Rate;
  canManage: boolean;
  onChange: (rate: Rate) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rate);

  function startEditing() {
    setDraft(rate);
    setEditing(true);
  }

  function save() {
    onChange({
      ...draft,
      cost: Math.max(0, Number(draft.cost) || 0),
      selling: Math.max(0, Number(draft.selling) || 0),
    });
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="rate-card-values">
        <div>
          <small>Cost rate</small>
          <strong>{rate.currency} {rate.cost.toLocaleString()}</strong>
        </div>
        <div>
          <small>Selling rate</small>
          <strong>{rate.currency} {rate.selling.toLocaleString()}</strong>
        </div>
        <span className="rate-card-tag">{rate.type}</span>
        <span className="rate-card-tag">{rate.unit}</span>
        {canManage && (
          <button
            type="button"
            className="icon-button rate-card-edit"
            onClick={startEditing}
            aria-label="Edit rates"
            title="Edit rates"
          >
            <Edit3 size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rate-card-editor">
      <label>
        Cost rate
        <input
          type="number"
          min="0"
          value={draft.cost}
          onChange={(event) =>
            setDraft((current) => ({ ...current, cost: Number(event.target.value) }))
          }
        />
      </label>
      <label>
        Selling rate
        <input
          type="number"
          min="0"
          value={draft.selling}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              selling: Number(event.target.value),
            }))
          }
        />
      </label>
      <label>
        Type
        <select
          value={draft.type}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              type: event.target.value as RateType,
            }))
          }
        >
          {rateTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </label>
      <label>
        Unit
        <select
          value={draft.unit}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              unit: event.target.value as RateUnit,
            }))
          }
        >
          {units.map((unit) => <option key={unit}>{unit}</option>)}
        </select>
      </label>
      <label>
        Currency
        <select
          value={draft.currency}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              currency: event.target.value as Currency,
            }))
          }
        >
          {currencies.map((currency) => <option key={currency}>{currency}</option>)}
        </select>
      </label>
      <button type="button" className="button button-primary rate-card-save" onClick={save}>
        <Check size={14} /> Save
      </button>
    </div>
  );
}

export function RateCardPage({
  canManage,
  templates,
  onCreate,
  onUpdate,
  onDelete,
  onNotify,
  preparedBy,
}: {
  canManage: boolean;
  templates: RateCardTemplate[];
  onCreate: (template: RateCardTemplate) => void;
  onUpdate: (template: RateCardTemplate) => void;
  onDelete: (templateId: string) => void;
  onNotify: (message: string) => void;
  preparedBy: string;
}) {
  const functions = useMemo(
    () =>
      Array.from(
        new Set([
          ...equipmentFunctions,
          ...staffFunctions.map((item) => item.role),
        ]),
      ),
    [],
  );
  const [selectedFunction, setSelectedFunction] = useState(functions[0]);
  const [rates, setRates] = useState<RateMap>(initialRates);

  const selectedEquipment = equipmentSeed.filter((item) =>
    item.functions.includes(selectedFunction),
  );
  const selectedStaff = staffSeed.filter(
    (item) => item.function.role === selectedFunction,
  );
  const resourceCount = selectedEquipment.length + selectedStaff.length;

  function updateRate(kind: ResourceKind, id: string, rate: Rate) {
    setRates((current) => ({ ...current, [rateKey(kind, id)]: rate }));
  }

  return (
    <section className="page-section rate-card-page">
      <PageHeader
        eyebrow="PRODUCTION / RATE CARD"
        title="Rate Card"
        copy="Manage cost and selling rates for the equipment and staff used across production."
      />
      <div className="rate-card-layout">
        <aside className="rate-card-functions">
          <div className="rate-card-panel-heading">
            <div>
              <span className="eyebrow">FUNCTIONS</span>
              <h3>Production resources</h3>
            </div>
            <span className="rate-card-total">{functions.length}</span>
          </div>
          <div className="rate-card-function-list">
            {functions.map((item) => {
              const count =
                equipmentSeed.filter((resource) => resource.functions.includes(item)).length +
                staffSeed.filter((resource) => resource.function.role === item).length;
              return (
                <button
                  type="button"
                  key={item}
                  className={selectedFunction === item ? "selected" : ""}
                  onClick={() => setSelectedFunction(item)}
                >
                  <span>{item}</span>
                  <small>{count}</small>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
        </aside>
        <div className="rate-card-content">
          <div className="rate-card-content-heading">
            <div>
              <span className="eyebrow">SELECTED FUNCTION</span>
              <h2>{selectedFunction}</h2>
              <p>{resourceCount} associated resource{resourceCount === 1 ? "" : "s"}</p>
            </div>
            <span className="rate-card-permission">
              <CircleDollarSign size={14} />
              {canManage ? "Rate management enabled" : "View only"}
            </span>
          </div>
          {!canManage && (
            <p className="rate-card-access-note">
              Cost and selling rates can be managed by the CEO and Head of Operations.
            </p>
          )}
          <div className="rate-card-resource-groups">
            <section className="rate-card-resource-group">
              <div className="rate-card-group-heading">
                <Package size={16} />
                <div>
                  <h3>Equipment</h3>
                  <span>{selectedEquipment.length} linked resource{selectedEquipment.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              {selectedEquipment.length ? (
                selectedEquipment.map((item) => (
                  <article className="rate-card-resource" key={item.id}>
                    <div className="rate-card-resource-icon"><Package size={16} /></div>
                    <div className="rate-card-resource-name">
                      <strong>{item.name}</strong>
                      <small>{item.id} · {item.company}</small>
                    </div>
                    <RateEditor
                      rate={rates[rateKey("Equipment", item.id)]}
                      canManage={canManage}
                      onChange={(rate) => updateRate("Equipment", item.id, rate)}
                    />
                  </article>
                ))
              ) : (
                <p className="rate-card-empty">No equipment is associated with this function.</p>
              )}
            </section>
            <section className="rate-card-resource-group">
              <div className="rate-card-group-heading">
                <UserRound size={16} />
                <div>
                  <h3>Staff</h3>
                  <span>{selectedStaff.length} linked resource{selectedStaff.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              {selectedStaff.length ? (
                selectedStaff.map((item) => (
                  <article className="rate-card-resource" key={item.id}>
                    <div className="rate-card-resource-icon staff"><UserRound size={16} /></div>
                    <div className="rate-card-resource-name">
                      <strong>{item.firstName} {item.lastName}</strong>
                      <small>{item.id} · {item.jobTitle}</small>
                    </div>
                    <RateEditor
                      rate={rates[rateKey("Staff", item.id)]}
                      canManage={canManage}
                      onChange={(rate) => updateRate("Staff", item.id, rate)}
                    />
                  </article>
                ))
              ) : (
                <p className="rate-card-empty">No staff is associated with this function.</p>
              )}
            </section>
          </div>
        </div>
      </div>
      <RateCardTemplatesPage
        templates={templates}
        canManage={canManage}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onNotify={onNotify}
        preparedBy={preparedBy}
      />
    </section>
  );
}
