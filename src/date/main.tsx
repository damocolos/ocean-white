import { useState } from 'react';
import { Layout } from '../components/Layout';
import '../style.css';
import {
  DateUnit,
  addDuration,
  getDaysBetween,
  getWorkdaysBetween,
  getDateDifference,
  isLeapYear,
  getDayOfYear,
  getWeekNumber,
  getRelativeTimeString,
  formatDateTimeLocal,
  formatDateString
} from './dateUtils';

export default function DateApp() {
  const [activeTab, setActiveTab] = useState<'math' | 'diff' | 'inspect'>('math');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // --- TAB 1: DATE MATH (ADD / SUBTRACT) ---
  const [baseDateTime, setBaseDateTime] = useState<string>(formatDateTimeLocal(new Date()));
  const [mathOperation, setMathOperation] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState<number>(7);
  const [unit, setUnit] = useState<DateUnit>('days');

  const computedMathResult = (() => {
    const base = baseDateTime ? new Date(baseDateTime) : new Date();
    const effectiveAmount = mathOperation === 'subtract' ? -amount : amount;
    return addDuration(base, effectiveAmount, unit);
  })();

  const mathFormatted = formatDateString(computedMathResult);
  const mathIso = !isNaN(computedMathResult.getTime()) ? computedMathResult.toISOString() : '';

  // --- TAB 2: DAYS BETWEEN / DIFFERENCE ---
  const [diffStartDate, setDiffStartDate] = useState<string>(formatDateTimeLocal(new Date()));
  const [diffEndDate, setDiffEndDate] = useState<string>(
    formatDateTimeLocal(addDuration(new Date(), 30, 'days'))
  );
  const [includeEndDay, setIncludeEndDay] = useState<boolean>(false);

  const startD = diffStartDate ? new Date(diffStartDate) : new Date();
  const endD = diffEndDate ? new Date(diffEndDate) : new Date();

  const totalDays = getDaysBetween(startD, endD, includeEndDay);
  const workdays = getWorkdaysBetween(startD, endD, includeEndDay);
  const diffResult = getDateDifference(startD, endD);

  const swapDiffDates = () => {
    const temp = diffStartDate;
    setDiffStartDate(diffEndDate);
    setDiffEndDate(temp);
  };

  // --- TAB 3: DATE INSPECTOR & TIMESTAMP ---
  const [inspectInput, setInspectInput] = useState<string>(formatDateTimeLocal(new Date()));
  const [timestampInput, setTimestampInput] = useState<string>(Math.floor(Date.now() / 1000).toString());

  const inspectDate = inspectInput ? new Date(inspectInput) : new Date();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <Layout homeLink="../" title="SUPER UTILS BROS">
      <h2 className="title">📅 DATE MANIPULATION UTILS 📅</h2>

      {/* Retro Mario Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`nes-btn ${activeTab === 'math' ? 'is-primary' : ''}`}
          onClick={() => setActiveTab('math')}
          style={{ flex: 1, minWidth: '130px', opacity: activeTab === 'math' ? 1 : 0.7 }}
        >
          Add / Subtract
        </button>
        <button
          className={`nes-btn ${activeTab === 'diff' ? 'is-success' : ''}`}
          onClick={() => setActiveTab('diff')}
          style={{ flex: 1, minWidth: '130px', opacity: activeTab === 'diff' ? 1 : 0.7 }}
        >
          Days Between
        </button>
        <button
          className={`nes-btn ${activeTab === 'inspect' ? 'is-warning' : ''}`}
          onClick={() => setActiveTab('inspect')}
          style={{ flex: 1, minWidth: '130px', opacity: activeTab === 'inspect' ? 1 : 0.7 }}
        >
          Date Inspector
        </button>
      </div>

      {/* TAB 1: ADDITION & SUBTRACTION */}
      {activeTab === 'math' && (
        <div>
          <div className="nes-field">
            <label htmlFor="base-datetime">Base Date & Time</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="base-datetime"
                type="datetime-local"
                className="nes-input"
                value={baseDateTime}
                onChange={(e) => setBaseDateTime(e.target.value)}
              />
              <button
                className="nes-btn is-warning"
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => setBaseDateTime(formatDateTimeLocal(new Date()))}
              >
                NOW
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="nes-field">
              <label>Operation</label>
              <div className="nes-select">
                <select
                  value={mathOperation}
                  onChange={(e) => setMathOperation(e.target.value as 'add' | 'subtract')}
                >
                  <option value="add">➕ Add (+)</option>
                  <option value="subtract">➖ Subtract (-)</option>
                </select>
              </div>
            </div>

            <div className="nes-field">
              <label>Amount</label>
              <input
                type="number"
                className="nes-input"
                value={amount}
                min="0"
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>

            <div className="nes-field">
              <label>Unit</label>
              <div className="nes-select">
                <select value={unit} onChange={(e) => setUnit(e.target.value as DateUnit)}>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Seconds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="nes-field">
            <label>Quick Presets</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="nes-btn"
                style={{ backgroundColor: '#3498db', color: 'white', fontSize: '0.7rem', padding: '0.5rem' }}
                onClick={() => { setMathOperation('add'); setAmount(1); setUnit('days'); }}
              >
                +1 Day
              </button>
              <button
                className="nes-btn"
                style={{ backgroundColor: '#3498db', color: 'white', fontSize: '0.7rem', padding: '0.5rem' }}
                onClick={() => { setMathOperation('add'); setAmount(7); setUnit('days'); }}
              >
                +7 Days
              </button>
              <button
                className="nes-btn"
                style={{ backgroundColor: '#3498db', color: 'white', fontSize: '0.7rem', padding: '0.5rem' }}
                onClick={() => { setMathOperation('add'); setAmount(1); setUnit('months'); }}
              >
                +1 Month
              </button>
              <button
                className="nes-btn"
                style={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '0.7rem', padding: '0.5rem' }}
                onClick={() => { setMathOperation('subtract'); setAmount(1); setUnit('days'); }}
              >
                -1 Day
              </button>
              <button
                className="nes-btn"
                style={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '0.7rem', padding: '0.5rem' }}
                onClick={() => { setMathOperation('subtract'); setAmount(7); setUnit('days'); }}
              >
                -7 Days
              </button>
              <button
                className="nes-btn"
                style={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '0.7rem', padding: '0.5rem' }}
                onClick={() => { setMathOperation('subtract'); setAmount(1); setUnit('months'); }}
              >
                -1 Month
              </button>
            </div>
          </div>

          <div className="nes-field">
            <label>Result Date & Time</label>
            <div className="result-box" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
              {mathFormatted}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="nes-btn is-warning"
              style={{ flex: 1 }}
              onClick={() => handleCopy(mathFormatted)}
            >
              {copiedText === mathFormatted ? 'COPIED!' : 'COPY LOCAL FORMAT'}
            </button>
            <button
              className="nes-btn is-primary"
              style={{ flex: 1 }}
              onClick={() => handleCopy(mathIso)}
            >
              {copiedText === mathIso ? 'COPIED!' : 'COPY ISO STRING'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: DAYS BETWEEN & DIFFERENCE */}
      {activeTab === 'diff' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'end', marginBottom: '1rem' }}>
            <div className="nes-field" style={{ margin: 0 }}>
              <label htmlFor="start-date">Start Date & Time</label>
              <input
                id="start-date"
                type="datetime-local"
                className="nes-input"
                value={diffStartDate}
                onChange={(e) => setDiffStartDate(e.target.value)}
              />
            </div>
            <button
              className="nes-btn"
              style={{ backgroundColor: '#9b59b6', color: 'white', padding: '0.5rem 0.8rem', height: '42px' }}
              title="Swap dates"
              onClick={swapDiffDates}
            >
              🔄
            </button>
            <div className="nes-field" style={{ margin: 0 }}>
              <label htmlFor="end-date">End Date & Time</label>
              <input
                id="end-date"
                type="datetime-local"
                className="nes-input"
                value={diffEndDate}
                onChange={(e) => setDiffEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="nes-field">
            <label className="nes-checkbox">
              <input
                type="checkbox"
                checked={includeEndDay}
                onChange={(e) => setIncludeEndDay(e.target.checked)}
              />
              Include end day (+1 day to total)
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="nes-container" style={{ textAlign: 'center', backgroundColor: '#fbd000', color: 'black', margin: 0, padding: '1rem' }}>
              <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>TOTAL DAYS</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalDays}</span>
            </div>
            <div className="nes-container" style={{ textAlign: 'center', backgroundColor: '#43b047', color: 'white', margin: 0, padding: '1rem' }}>
              <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>WORKING DAYS (MON-FRI)</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{workdays}</span>
            </div>
          </div>

          <div className="nes-field">
            <label>Detailed Duration Breakdown</label>
            <div className="result-box" style={{ fontSize: '0.9rem' }}>
              {diffResult.formatted}
            </div>
          </div>

          <div className="nes-field">
            <label>Totals Summary</label>
            <div style={{ fontSize: '0.75rem', lineHeight: '1.8', background: '#f5f5f5', color: '#000', padding: '0.8rem', border: '3px solid #000' }}>
              <div>• Total Hours: <strong>{diffResult.totalHours.toLocaleString()}</strong> hrs</div>
              <div>• Total Minutes: <strong>{diffResult.totalMinutes.toLocaleString()}</strong> mins</div>
              <div>• Relative Difference: <strong>{getRelativeTimeString(endD, startD)}</strong></div>
            </div>
          </div>

          <button
            className="nes-btn is-success"
            style={{ width: '100%' }}
            onClick={() => handleCopy(`${totalDays} total days (${workdays} working days) - ${diffResult.formatted}`)}
          >
            {copiedText?.includes('total days') ? 'COPIED SUMMARY!' : 'COPY SUMMARY'}
          </button>
        </div>
      )}

      {/* TAB 3: DATE INSPECTOR & TIMESTAMP */}
      {activeTab === 'inspect' && (
        <div>
          <div className="nes-field">
            <label htmlFor="inspect-date">Select Date & Time to Inspect</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="inspect-date"
                type="datetime-local"
                className="nes-input"
                value={inspectInput}
                onChange={(e) => {
                  setInspectInput(e.target.value);
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) {
                    setTimestampInput(Math.floor(d.getTime() / 1000).toString());
                  }
                }}
              />
              <button
                className="nes-btn is-warning"
                onClick={() => {
                  const now = new Date();
                  setInspectInput(formatDateTimeLocal(now));
                  setTimestampInput(Math.floor(now.getTime() / 1000).toString());
                }}
              >
                NOW
              </button>
            </div>
          </div>

          <div className="nes-field">
            <label htmlFor="timestamp-input">Unix Timestamp (Seconds or Milliseconds)</label>
            <input
              id="timestamp-input"
              type="text"
              className="nes-input"
              value={timestampInput}
              onChange={(e) => {
                const val = e.target.value;
                setTimestampInput(val);
                const num = Number(val);
                if (!isNaN(num) && val.trim() !== '') {
                  const d = num > 1e11 ? new Date(num) : new Date(num * 1000);
                  if (!isNaN(d.getTime())) {
                    setInspectInput(formatDateTimeLocal(d));
                  }
                }
              }}
            />
          </div>

          {!isNaN(inspectDate.getTime()) ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', margin: '1.5rem 0' }}>
              <div style={{ background: '#34495e', color: 'white', padding: '0.8rem', border: '3px solid #000', fontSize: '0.75rem' }}>
                <span style={{ color: '#f1c40f', display: 'block', marginBottom: '0.3rem' }}>DAY OF WEEK</span>
                <strong>{inspectDate.toLocaleDateString('en-US', { weekday: 'long' })}</strong>
              </div>

              <div style={{ background: '#34495e', color: 'white', padding: '0.8rem', border: '3px solid #000', fontSize: '0.75rem' }}>
                <span style={{ color: '#f1c40f', display: 'block', marginBottom: '0.3rem' }}>DAY OF YEAR</span>
                <strong>Day {getDayOfYear(inspectDate)} of {isLeapYear(inspectDate.getFullYear()) ? 366 : 365}</strong>
              </div>

              <div style={{ background: '#34495e', color: 'white', padding: '0.8rem', border: '3px solid #000', fontSize: '0.75rem' }}>
                <span style={{ color: '#f1c40f', display: 'block', marginBottom: '0.3rem' }}>ISO WEEK NUMBER</span>
                <strong>Week {getWeekNumber(inspectDate)}</strong>
              </div>

              <div style={{ background: '#34495e', color: 'white', padding: '0.8rem', border: '3px solid #000', fontSize: '0.75rem' }}>
                <span style={{ color: '#f1c40f', display: 'block', marginBottom: '0.3rem' }}>LEAP YEAR?</span>
                <strong>{isLeapYear(inspectDate.getFullYear()) ? 'YES (366 days)' : 'NO (365 days)'}</strong>
              </div>

              <div style={{ background: '#34495e', color: 'white', padding: '0.8rem', border: '3px solid #000', fontSize: '0.75rem', gridColumn: 'span 2' }}>
                <span style={{ color: '#f1c40f', display: 'block', marginBottom: '0.3rem' }}>RELATIVE TIME FROM NOW</span>
                <strong>{getRelativeTimeString(inspectDate)}</strong>
              </div>
            </div>
          ) : (
            <div className="result-box" style={{ backgroundColor: '#e74c3c', color: 'white' }}>
              INVALID DATE / TIMESTAMP
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="nes-btn is-primary"
              style={{ flex: 1 }}
              onClick={() => handleCopy(Math.floor(inspectDate.getTime() / 1000).toString())}
            >
              COPY SECONDS
            </button>
            <button
              className="nes-btn is-warning"
              style={{ flex: 1 }}
              onClick={() => handleCopy(inspectDate.getTime().toString())}
            >
              COPY MILLISECONDS
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
