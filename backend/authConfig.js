const passportConfig = {
    credentials: {
        tenantID: process.env.AZ_TENANT_ID,
        clientID: process.env.AZ_CLIENT_ID
    },
    metadata: {
        authority: "login.microsoftonline.com",
        discovery: ".well-known/openid-configuration",
        version: "v2.0"
    },
    settings: {
        validateIssuer: true,
        passReqToCallback: true,
        // loggingLevel: "none",
        loggingNoPII: true,
    },
    protectedRoutes: {
        api: {
            endpoint: "/api",
            delegatedPermissions: {
                read: ["Todolist.Read", "Todolist.ReadWrite"],
                write: ["Todolist.ReadWrite"]
            },
            applicationPermissions: {
                read: ["Todolist.Read.All", "Todolist.ReadWrite.All"],
                write: ["Todolist.ReadWrite.All"]
            }
        }
    }
}

module.exports = passportConfig;
