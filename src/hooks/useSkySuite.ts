import { useState, useEffect } from 'react';
import { SkySuiteDB } from '../lib/db/store';

export function useSkySuite() {
  const [state, setState] = useState(() => SkySuiteDB.getState());

  useEffect(() => {
    const unsubscribe = SkySuiteDB.subscribe(() => {
      setState({ ...SkySuiteDB.getState() });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const currentOrg = SkySuiteDB.getCurrentOrg();
  const settings = SkySuiteDB.getCurrentSettings();
  const summary = SkySuiteDB.getFinancialSummary();

  return {
    state,
    currentOrg,
    settings,
    summary,
    db: SkySuiteDB,
  };
}
