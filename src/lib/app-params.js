const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;

// Safely get storage, falling back gracefully if blocked (iOS ITP / private mode)
const getStorage = (type) => {
	try {
		const s = windowObj[type];
		s.setItem('__test__', '1');
		s.removeItem('__test__');
		return s;
	} catch {
		return null;
	}
};

const localStorage_ = isNode ? new Map() : getStorage('localStorage');
const sessionStorage_ = isNode ? null : getStorage('sessionStorage');

const storageGet = (key) => {
	return localStorage_?.getItem(key) ?? sessionStorage_?.getItem(key) ?? null;
};

const storageSet = (key, value) => {
	// Write to both so the token survives across iOS redirect boundaries
	localStorage_?.setItem(key, value);
	sessionStorage_?.setItem(key, value);
};

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);

	// Store the value BEFORE removing it from the URL so it's persisted first
	if (searchParam) {
		storageSet(storageKey, searchParam);
	}

	if (removeFromUrl && searchParam) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
		try {
			window.history.replaceState({}, document.title, newUrl);
		} catch {
			// replaceState can fail in some WKWebView contexts — ignore
		}
	}

	if (searchParam) {
		return searchParam;
	}
	if (defaultValue) {
		storageSet(storageKey, defaultValue);
		return defaultValue;
	}
	return storageGet(storageKey);
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		localStorage_?.removeItem('base44_access_token');
		localStorage_?.removeItem('token');
		sessionStorage_?.removeItem('base44_access_token');
		sessionStorage_?.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}