from PIL import Image
import math
import itertools

def make_chunks(image_path, num_h_crop = 2, num_v_crop = 2):
    """slice an image into parts """
    img = Image.open(image_path)
    width, height = img.size

    # compute crop properties using image measure and the wanted number of pieces
    h_crop_width = width / num_h_crop
    v_crop_width = height / num_v_crop

    # x and y represent Cartesian pixel coordinates.
    # 0,0 is up left
    # the norm between 2 ticks on horizontal x axis is h_crop_width
    # the norm between 2 ticks on vertical y axis is v_crop_width
    x = [h_crop_width * e for e in range (num_h_crop +1)]
    y = [v_crop_width * e for e in range (num_v_crop +1)]
    # +1 in order to have coord of rigth limit of the image

    chunks_starting_coords = itertools.product(x[:-1], y[:-1])
    chunks_ending_coords = itertools.product(x[1:], y[1:])

    chunks_coords = zip (chunks_starting_coords, chunks_ending_coords)
    for chunk_idx, chunk_coords in enumerate(chunks_coords) :
        ((left, upper), (right, lower)) = chunk_coords
        box = (left , upper , right , lower) # pixel coords of the chunk
        print (chunk_idx, box)
        new_chunk = img.crop(box)
        new_chunk.save("out_{0}.jpg".format(chunk_idx) )
