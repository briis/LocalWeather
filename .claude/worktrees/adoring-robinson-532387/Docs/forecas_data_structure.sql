CREATE TABLE `forecast_daily` ( 
  `day_num` INT NOT NULL,
  `datetime` DATETIME NULL DEFAULT NULL ,
  `temperature` FLOAT NULL DEFAULT NULL ,
  `temp_low` FLOAT NULL DEFAULT NULL ,
  `description` VARCHAR(250) NULL DEFAULT NULL ,
  `icon` VARCHAR(50) NULL DEFAULT NULL ,
  `precipitation_probability` INT NULL DEFAULT NULL ,
  `precipitation` FLOAT NULL DEFAULT NULL ,
  `pressure` FLOAT NULL DEFAULT NULL ,
  `sunriseepoch` INT NULL DEFAULT NULL ,
  `sunsetepoch` INT NULL DEFAULT NULL ,
  `wind_bearing` INT NULL DEFAULT NULL ,
  `wind_speed` FLOAT NULL DEFAULT NULL ,
  `wind_gust` FLOAT NULL DEFAULT NULL ,
  `conditions` VARCHAR(50) NULL DEFAULT NULL ,
   PRIMARY KEY (`day_num`)
)
ENGINE = InnoDB;
CREATE TABLE `forecast_hourly` ( 
  `hour_num` INT NOT NULL,
  `datetime` DATETIME NULL DEFAULT NULL ,
  `temperature` FLOAT NULL DEFAULT NULL ,
  `apparent_temperature` FLOAT NULL DEFAULT NULL ,
  `humidity` INT NULL DEFAULT NULL ,
  `description` VARCHAR(250) NULL DEFAULT NULL ,
  `icon` VARCHAR(50) NULL DEFAULT NULL ,
  `precipitation_probability` INT NULL DEFAULT NULL ,
  `precipitation` FLOAT NULL DEFAULT NULL ,
  `pressure` FLOAT NULL DEFAULT NULL ,
  `wind_bearing` INT NULL DEFAULT NULL ,
  `wind_speed` FLOAT NULL DEFAULT NULL ,
  `wind_gust` FLOAT NULL DEFAULT NULL ,
  `uv_index` FLOAT NULL DEFAULT NULL ,
  `visibility` FLOAT NULL DEFAULT NULL ,
   PRIMARY KEY (`hour_num`)
)
ENGINE = InnoDB;
