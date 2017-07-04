#!/bin/bash
now=$(date +"%Y%m%d")

mkdir extracted_data_$now
#-----
# get space separated string of tablenames
outputtablenames=$(sqlite3 data/data.db '.tables')
echo $outputtablenames

#-----
# transform space separated string of tablenames into array of tablenames :
IFS=' ' read -ra tablenames <<< "$outputtablenames"
# read option :
# r :
#   raw input - disables interpretion of backslash escapes and line-continuation in the read data
#   example :
#   $ str="a\bc"; read x <<< "$str"; read -r y <<< "$str"; echo "$x"; echo "$y"
# a :
#   read the data word-wise into the specified array <ARRAY> = tablenames
#   -> tablenames is an array

#-----
# iterate through tablenames and dump a csv :
for tablename in "${tablenames[@]}"; do
    echo $tablename "extracted_data_$now/"$tablename"_$now.csv" ;
    sqlite3 -header -csv data/data.db "select * from $tablename;" > "extracted_data_$now/"$tablename"_"$now".csv"
done

#-----
# merge these csv into a flat file :
# containing :
# Annotaition : x, y width, height , annotation, sample id, row, col
# Sample :  smear type , licence, magnification,

DELIMITER=","

# for each line of Annotation.csv file :
# cut -> selected input is written in the same order that it is read
# use awk instead if wanna rearrange column order
while read line; do
    x_y_width_height_tag_sampleid_row_col=$(echo $line  |  cut -d "${DELIMITER}" -f 6,7,8,9,10,13,2,3);
    sampleid=$(echo $line  |  cut -d "${DELIMITER}" -f 13);
    smeartype_licence_magnification=$(grep "^${sampleid}," "extracted_data_"$now"/Samples_"$now".csv" | cut -f 3,7,9 -d "${DELIMITER}");
    # /!\ grep has to find only one line !

    processed_annotation=$x_y_width_height_tag_sampleid_row_col,$smeartype_licence_magnification
    echo $processed_annotation
    echo $processed_annotation >> "extracted_data_$now/extracted_data_$now.csv"
done <"extracted_data_$now/Annotations_$now.csv"
