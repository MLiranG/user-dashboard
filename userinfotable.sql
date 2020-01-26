CREATE TABLE `userinfo` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `profilepic` mediumtext,
  `email` varchar(50) NOT NULL,
  `name` mediumtext,
  `city` tinytext,
  `school` mediumtext,
  `hobbies` longtext,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
