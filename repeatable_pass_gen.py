import os
from sys import platform
import random
import string
from colorama import Fore, Back, Style

def errorcode(ERRORCODE):
    if ERRORCODE == 1:
        print(Fore.RED + "ERROR: NO USERNAME - Please enter valid username")
    elif ERRORCODE == 2:
        print(Fore.RED + "ERROR: CHARACTER DETECTED - Only use digits in passworld length")
    elif ERRORCODE == 3:
        print(Fore.RED + "ERROR: NO WEBSITE - Please enter valid website or software")

def main():
    ERRORCODE = ""

    while True:
        
        if platform == "linux" or platform == "linux2":
            os.system("clear")
        elif platform == "win32":
            os.system("cls")
        errorcode(ERRORCODE)
        print(Style.RESET_ALL,end='')
        if ERRORCODE == "" or ERRORCODE == 1:
            user_input = input('Input Username: ')
        elif ERRORCODE >= 2:
            print('Input Username: ' + user_input)
        if user_input == "":
            ERRORCODE = 1
            continue
        split_pass = list(user_input.lower())

        if ERRORCODE == "" or ERRORCODE <= 2:
            wanted_len = input('Password Length Wanted (default 32): ')
        elif ERRORCODE == 3:
            print('Password Length Wanted (default 32):', wanted_len)

        if wanted_len == "":
            wanted_len = 32
            print("By default password length set to 32")
        elif str(wanted_len).isalpha():
            ERRORCODE = 2
            continue

        if ERRORCODE == "" or ERRORCODE <= 3:
            web_location = input('Website Name: ')
        if web_location == "":
            ERRORCODE = 3
            continue
        split_web = list(web_location.lower())

        pass_dec_split = []
        for char in split_pass:
            pass_dec_split.append(format(ord(char)))
        pass_dec_joined = "".join(pass_dec_split)

        web_dec_split = []
        for char in split_web:
            web_dec_split.append(format(ord(char)))
        web_dec_joined = "".join(web_dec_split)


        random.seed(pass_dec_joined + web_dec_joined)
        random_char = []
        full_string = string.ascii_letters + string.digits + string.punctuation


        for i in range(int(wanted_len)):
            random_char.append(random.choice(full_string))
        random_char = "".join(random_char)
        return random_char

if __name__ == "__main__":
    password = main()
    print("\nPassword is:\n" + password + "\n")