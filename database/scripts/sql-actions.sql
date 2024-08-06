-- Active: 1700864320883@@127.0.0.1@3307@vpcprovisioner
LOCK TABLES aws_access_list WRITE,
			aws_accounts WRITE,
			aws_azs WRITE,
			aws_regions WRITE,
			configs WRITE,
			config_shares WRITE,
			user_group_assignments WRITE,
			user_groups WRITE,
			users WRITE;

OPTIMIZE TABLE aws_access_list,
               aws_accounts,
               aws_azs,
               aws_regions,
               configs,
               config_shares,
               user_group_assignments,
               user_groups,
               users;

UNLOCK TABLES;


ALTER TABLE configs AUTO_INCREMENT = 1;


ALTER TABLE config_shares AUTO_INCREMENT = 1;


ALTER TABLE user_groups AUTO_INCREMENT = 1;


ALTER TABLE user_group_assignments AUTO_INCREMENT = 1;


ALTER TABLE users AUTO_INCREMENT = 3;

UNLOCK TABLES;

OPTIMIZE TABLE configs;

