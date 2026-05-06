CREATE TABLE `minute_data` ( 
  `logdate` DATETIME NOT NULL,
  `temperature` FLOAT NULL DEFAULT NULL ,
  `wind_chill` FLOAT NULL DEFAULT NULL ,
  `air_Quality_pm1` FLOAT NULL DEFAULT NULL ,
  `air_Quality_pm10` FLOAT NULL DEFAULT NULL ,
  `air_Quality_pm25` FLOAT NULL DEFAULT NULL ,
  `heat_index` FLOAT NULL DEFAULT NULL ,
  `humidity` INT NULL DEFAULT NULL ,
  `dewpoint` FLOAT NULL DEFAULT NULL ,
  `rain_rate` FLOAT NULL DEFAULT NULL ,
  `rain_day` FLOAT NULL DEFAULT NULL ,
  `rain_hour` FLOAT NULL DEFAULT NULL ,
  `wind_speed` FLOAT NULL DEFAULT NULL ,
  `wind_gust` FLOAT NULL DEFAULT NULL ,
  `wind_bearing` INT NULL DEFAULT NULL ,
  `pressure` FLOAT NULL DEFAULT NULL ,
  `pressure_trend` FLOAT NULL DEFAULT NULL ,
  `uv` FLOAT NULL DEFAULT NULL ,
  `solar_radiation` FLOAT NULL DEFAULT NULL ,
   PRIMARY KEY (`logdate`),
  CONSTRAINT `date_index` UNIQUE (`logdate`)
)
ENGINE = InnoDB;
