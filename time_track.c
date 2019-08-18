#include <stdio.h>
#include <time.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>

static void die(char* e){
    perror(e);
    exit(EXIT_FAILURE);
}

static time_t getTime(char prefix, FILE*f){
    char buffer[1024];
    while (fgets(buffer,1023,f)!= NULL)
    {
        if(prefix == buffer[0]) {
            long long re = strtol(buffer+1,NULL,10);
            return re;
        } else {
            continue;
        }
    }
    if(ferror(f)) {
        die("fgets");
    }
    if(feof(f)){
        perror("EOF");
    }
    return -1;    
}

int main(int argc, char* argv[]) {
    if(argc != 2){ 
        printf("[USAGE]: %s [-login|-i|-logout|-o|]\n",argv[0]);
    }else if(strcmp(argv[1],"-login") == 0 || strcmp(argv[1],"-i") == 0){
        time_t start = time(NULL);
        FILE* f = fopen(".tmp.time","a+");
        if(f == NULL)
            die("fopen");
        fprintf(f,">%lld\n",(long long)start);
        fflush(f);
        fclose(f);
        printf("login successfull\n");
    } else if(strcmp(argv[1],"-logout") == 0 || strcmp(argv[1],"-o") == 0){
        FILE* f = fopen(".tmp.time","r");
        time_t t1 = getTime('>',f);
        time_t end = time(NULL);
        long long all = (long long) (end - t1);
        long long s = all % 60;
        all = (all - s) / 60;
        long long m = all % 60;
        all = (all - m) / 60;
        long long h = all;
        printf("LOGIN : %lld\nLOGOUT: %lld",t1,end);
        printf("Worked:%lld::%lld::%lld\n",h,m,s);
        // remove .tmp.time
        int status = remove(".tmp.time");
        if (status == 0)
            printf(".tmp.time file deleted successfully.\n");
        else {
            fprintf(stderr,"Unable to delete the file\n");
            perror("Following error occurred");
            //die("remove");
        }
        FILE* time_tracker = fopen(".tracker.time","a+");
        if(time_tracker == NULL){
            fprintf(stderr,"Unable to save time\n");
            die("fopen");
        }
        // date
        struct tm tm = *localtime(&end);
        fprintf(time_tracker,"%d-%d-%d:\t\t%lld::%lld::%lld\n",tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday,h,m,s);
        fclose(f);
        fclose(time_tracker);
        printf("logout successfull\n");
    } else {
        printf("[USAGE]: %s [-login|-i|-logout|-o|]\n",argv[0]);
    }
}