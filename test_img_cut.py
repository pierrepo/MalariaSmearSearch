from PIL import Image
import math
import itertools

def make_chunks(image_path, num_crop_col = 2, num_crop_row = 2):
    """slice an image into parts """
    img = Image.open(image_path)
    width, height = img.size

    # compute crop properties using image measure and the wanted number of pieces
    width_crop_col = width / num_crop_col
    width_crop_row = height / num_crop_row

    # x and y represent Cartesian pixel coordinates.
    # 0,0 is up left
    # the norm between 2 ticks on horizontal x axis is width_crop_col
    # the norm between 2 ticks on vertical y axis is width_crop_row
    cut_col = [width_crop_col * e for e in range (num_crop_col +1)]
    cut_row = [width_crop_row * e for e in range (num_crop_row +1)]
    # +1 in order to have coord of rigth limit of the image

    chunks_starting_coords = itertools.product(cut_col[:-1],  cut_row[:-1])
    chunks_ending_coords = itertools.product(cut_col[1:], cut_row[1:])

    chunks_coords = zip (chunks_starting_coords, chunks_ending_coords)
    for chunk_idx, chunk_coords in enumerate(chunks_coords) :
        box = list(itertools.chain.from_iterable(chunk_coords)) #(left , upper , right , lower) # pixel coords of the chunk
        print (chunk_idx, box)
        new_chunk = img.crop(box)
        new_chunk.save("out_{0}.jpg".format(chunk_idx) )
