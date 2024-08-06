const express = require('express');
const router = express.Router();

const userLogin = require('./userLogin');
const adminUsers = require('./adminUsers');
const adminGroups = require('./adminGroups');
const configList = require('./configList');
const configDescribe = require('./configDescribe');
const configActions = require('./configActions');
const awsInfo = require('./awsInfo');
const createConfigAWS = require('./createConfigAWS');

const azInfo = require('./azInfo');
const createConfigAzure = require('./createConfigAzure');

router.get('/api/login', userLogin.userLogin);

router.get('/api/admin/get-users', adminUsers.getUsers);
router.get('/api/admin/user/get-memberships', adminUsers.getUserMemberships);
router.post('/api/admin/user/modify-memberships', adminUsers.modifyUserMemberships);
router.post('/api/admin/delete-user', adminUsers.deleteUser);

router.get('/api/admin/get-groups', adminGroups.getGroups);
router.post('/api/admin/groups/delete-group', adminGroups.deleteGroup);
router.post('/api/admin/groups/add-group', adminGroups.addGroup);
router.get('/api/admin/groups/get-members', adminGroups.getGroupMembers);
router.post('/api/admin/groups/modify-members', adminGroups.modifyGroupMembers);

router.get('/api/config-list', configList.getConfigList);
router.get('/api/get-config-shares', configList.getConfigShares);
router.post('/api/modify-config-shares', configList.modifyConfigShares);
router.get('/api/describe-config', configDescribe.configDescribe);
router.post('/api/modify-config', configActions.modifyConfig);

router.get('/api/aws/get-accounts', awsInfo.getAccounts);
router.get('/api/aws/get-regions', awsInfo.getRegions);
router.get('/api/aws/get-azs', awsInfo.getAZs);
router.post('/api/aws/post-config', createConfigAWS.createConfigAWS);

router.get('/api/az/get-subscriptions', azInfo.getSubscriptions);
router.get('/api/az/get-regions', azInfo.getRegions);
router.post('/api/az/post-config', createConfigAzure.createConfigAzure);

module.exports = router;