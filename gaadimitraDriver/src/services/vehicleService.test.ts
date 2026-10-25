import { apiClient } from './api';
import { vehicleService } from './vehicleService';

describe('VehicleService.getVehicles', () => {
  it('only fetches vehicles for the selected serviceId', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce([] as any);

    const result = await vehicleService.getVehicles('svc_123');

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('/vehicles?serviceId=svc_123');
    expect(result).toEqual([]);

    getSpy.mockRestore();
  });
});
