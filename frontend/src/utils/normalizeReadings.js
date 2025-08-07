import { cToF } from './ctof';

export const normalizeReadings = (rawData, tempUnit = 'C') => {
  return rawData.map((reading) => {
    const shouldConvert =
      reading.type === 'temperature' && tempUnit === 'F';

    return {
      ...reading,
      value: shouldConvert ? cToF(reading.value) : reading.value,
    };
  });
};
