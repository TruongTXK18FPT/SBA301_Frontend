import axios from "axios";
import { getToken } from "./localStorageService";

// Types for location data
interface LocationData {
    code: string;
    name: string;
}

const fetchProvinceName = async (provinceId: string): Promise<string> => {
    const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceId}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch province name");
    }
    const data: LocationData = await response.json();
    return data.name;
};

const fetchDistrictName = async (districtId: string): Promise<string> => {  
    const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtId}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch district name");
    }
    const data: LocationData = await response.json();
    return data.name;
};

// Helper function to format location names by removing prefix
export const formatLocationName = (fullName: string): string => {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : fullName;
};

// Cache for location names to avoid repeated API calls
const locationCache = new Map<string, string>();

export const getProvinceName = async (provinceCode: number): Promise<string> => {
    const cacheKey = `province_${provinceCode}`;
    
    if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey)!;
    }
    
    try {
        const fullName = await fetchProvinceName(provinceCode.toString());
        const formattedName = formatLocationName(fullName);
        locationCache.set(cacheKey, formattedName);
        return formattedName;
    } catch (error) {
        console.error(`Error fetching province name for code ${provinceCode}:`, error);
        return `Mã tỉnh: ${provinceCode}`;
    }
};

export const getDistrictName = async (districtCode: number): Promise<string> => {
    const cacheKey = `district_${districtCode}`;
    
    if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey)!;
    }
    
    try {
        const fullName = await fetchDistrictName(districtCode.toString());
        const formattedName = formatLocationName(fullName);
        locationCache.set(cacheKey, formattedName);
        return formattedName;
    } catch (error) {
        console.error(`Error fetching district name for code ${districtCode}:`, error);
        return `Mã quận/huyện: ${districtCode}`;
    }
};