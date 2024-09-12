import { jwtDecode } from "jwt-decode";

export function getUserName() {
    let storageObject = JSON.parse(sessionStorage.getItem(`msal.token.keys.${window.frontendConfig.REACT_APP_AZ_CLIENT_ID}`));
    let tokenName = storageObject.idToken[0];
    let tokenEncoded = JSON.parse(sessionStorage.getItem(tokenName)).secret
    let tokenDecoded = jwtDecode(tokenEncoded);
    return tokenDecoded.name
}
export function getUserEmail() {
    let storageObject = JSON.parse(sessionStorage.getItem(`msal.token.keys.${window.frontendConfig.REACT_APP_AZ_CLIENT_ID}`));
    let tokenName = storageObject.idToken[0];
    let tokenEncoded = JSON.parse(sessionStorage.getItem(tokenName)).secret
    let tokenDecoded = jwtDecode(tokenEncoded);
    return tokenDecoded.preferred_username
}
export function isUserAdmin() {
    let storageObject = JSON.parse(sessionStorage.getItem(`msal.token.keys.${window.frontendConfig.REACT_APP_AZ_CLIENT_ID}`));
    let tokenName = storageObject.idToken[0];
    let tokenEncoded = JSON.parse(sessionStorage.getItem(tokenName)).secret
    let tokenDecoded = jwtDecode(tokenEncoded);
    let adAdminGrpId = window.frontendConfig.REACT_APP_AZ_ADMIN_GRP_ID
    let userIsAdmin = tokenDecoded.roles.includes(adAdminGrpId)
    return userIsAdmin
}

export function getMsalToken() {
    let storageObject = JSON.parse(sessionStorage.getItem(`msal.token.keys.${window.frontendConfig.REACT_APP_AZ_CLIENT_ID}`));
    let tokenName = storageObject.idToken[0];
    let tokenEncoded = JSON.parse(sessionStorage.getItem(tokenName)).secret
    return tokenEncoded
}

